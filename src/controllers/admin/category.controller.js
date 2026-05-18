const prisma = require("../../utils/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const { success, error } = require("../../utils/apiResponse");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const categoryInclude = {
  parent: { select: { id: true, name: true, slug: true } },
  children: { select: { id: true, name: true, slug: true, sortOrder: true, isActive: true } },
  _count: { select: { products: true, children: true } },
};

const SORTABLE_FIELDS = ["sortOrder", "name", "createdAt"];

const buildListFilters = (query) => {
  const where = {};

  if (query.search) {
    where.name = { contains: query.search, mode: "insensitive" };
  }
  // parentId="root" -> only top-level categories
  if (query.parentId === "root") where.parentId = null;
  else if (query.parentId) where.parentId = query.parentId;

  if (query.isActive === "true") where.isActive = true;
  else if (query.isActive === "false") where.isActive = false;

  return where;
};

// Walk up from `candidateParentId` to root; if we encounter `categoryId`,
// moving `categoryId` under that parent would create a cycle.
const wouldCreateCycle = async (categoryId, candidateParentId) => {
  if (!candidateParentId) return false;
  if (candidateParentId === categoryId) return true;

  let current = candidateParentId;
  const visited = new Set();
  while (current) {
    if (visited.has(current)) return true; // pre-existing cycle, bail
    visited.add(current);
    const node = await prisma.category.findUnique({
      where: { id: current },
      select: { parentId: true },
    });
    if (!node) return false;
    if (node.parentId === categoryId) return true;
    current = node.parentId;
  }
  return false;
};

const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT),
  );
  const skip = (page - 1) * limit;

  const sortField = SORTABLE_FIELDS.includes(req.query.sortBy)
    ? req.query.sortBy
    : "sortOrder";
  const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

  const where = buildListFilters(req.query);

  const [records, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      include: categoryInclude,
      orderBy: { [sortField]: sortOrder },
    }),
    prisma.category.count({ where }),
  ]);

  return success(res, 200, "Categories list", {
    data: records,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

const getOne = asyncHandler(async (req, res) => {
  const param = req.params.id;
  let category = null;

  try {
    category = await prisma.category.findUnique({
      where: { id: param },
      include: categoryInclude,
    });
  } catch (_) {
    category = null;
  }

  if (!category) {
    try {
      category = await prisma.category.findFirst({
        where: { slug: param },
        include: categoryInclude,
      });
    } catch (_) {
      category = null;
    }
  }

  if (!category) return error(res, 404, "Category not found");
  return success(res, 200, "Category retrieved successfully", category);
});

const create = asyncHandler(async (req, res) => {
  const category = await prisma.category.create({
    data: req.body,
    include: categoryInclude,
  });
  return success(res, 201, "Category created successfully", category);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "Category not found");

  if (req.body.slug && req.body.slug !== existing.slug) {
    const dup = await prisma.category.findFirst({
      where: { slug: req.body.slug, NOT: { id } },
    });
    if (dup) return error(res, 409, "slug already exists");
  }

  if (
    Object.prototype.hasOwnProperty.call(req.body, "parentId") &&
    req.body.parentId !== existing.parentId
  ) {
    if (await wouldCreateCycle(id, req.body.parentId)) {
      return error(
        res,
        400,
        "Invalid parent: would create a cycle in the category tree",
      );
    }
  }

  const updated = await prisma.category.update({
    where: { id },
    data: req.body,
    include: categoryInclude,
  });
  return success(res, 200, "Category updated successfully", updated);
});

// Soft delete: Product.categoryId is onDelete:Restrict, so hard-deleting a
// category with products would fail. Set isActive=false instead; children
// keep pointing to this category (no orphaning, no cascade).
const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "Category not found");

  if (!existing.isActive) {
    return error(res, 400, "Category is already inactive");
  }

  const updated = await prisma.category.update({
    where: { id },
    data: { isActive: false },
    include: categoryInclude,
  });
  return success(res, 200, "Category deactivated successfully", updated);
});

module.exports = { list, getOne, create, update, remove };
