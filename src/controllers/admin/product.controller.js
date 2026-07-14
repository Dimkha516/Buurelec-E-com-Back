const prisma = require("../../utils/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const { success, error } = require("../../utils/apiResponse");
const { getCasualSupplier } = require("../../services/supplierService");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const productInclude = {
  category: true,
  brand: true,
  supplier: true,
  images: { orderBy: { sortOrder: "asc" } },
  features: { orderBy: { sortOrder: "asc" } },
};

const SORTABLE_FIELDS = ["createdAt", "price", "name", "stock"];

const buildListFilters = (query) => {
  const where = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { sku: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.brandId) where.brandId = query.brandId;
  if (query.supplierId) where.supplierId = query.supplierId;
  if (query.badge) where.badge = query.badge;

  if (query.isActive === "true") where.isActive = true;
  else if (query.isActive === "false") where.isActive = false;

  if (query.isFeatured === "true") where.isFeatured = true;
  else if (query.isFeatured === "false") where.isFeatured = false;

  if (query.inStock === "true") where.stock = { gt: 0 };
  else if (query.inStock === "false") where.stock = { equals: 0 };

  return where;
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
    : "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

  const where = buildListFilters(req.query);

  const [records, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: productInclude,
      orderBy: { [sortField]: sortOrder },
    }),
    prisma.product.count({ where }),
  ]);

  return success(res, 200, "Products list", {
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
  let product = null;

  try {
    product = await prisma.product.findUnique({
      where: { id: param },
      include: productInclude,
    });
  } catch (_) {
    product = null;
  }

  if (!product) {
    try {
      product = await prisma.product.findFirst({
        where: { slug: param },
        include: productInclude,
      });
    } catch (_) {
      product = null;
    }
  }

  if (!product) return error(res, 404, "Product not found");
  return success(res, 200, "Product retrieved successfully", product);
});

const create = asyncHandler(async (req, res) => {
  // Default to the Casual supplier when the admin doesn't pick one.
  const data = { ...req.body };
  if (!data.supplierId) {
    const casual = await getCasualSupplier();
    data.supplierId = casual.id;
  }

  const product = await prisma.product.create({
    data,
    include: productInclude,
  });
  return success(res, 201, "Product created successfully", product);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "Product not found");

  // Uniqueness check excluding self (default checkUnique would 409 on self-match)
  if (req.body.slug && req.body.slug !== existing.slug) {
    const dup = await prisma.product.findFirst({
      where: { slug: req.body.slug, NOT: { id } },
    });
    if (dup) return error(res, 409, "slug already exists");
  }
  if (req.body.sku && req.body.sku !== existing.sku) {
    const dup = await prisma.product.findFirst({
      where: { sku: req.body.sku, NOT: { id } },
    });
    if (dup) return error(res, 409, "sku already exists");
  }

  const updated = await prisma.product.update({
    where: { id },
    data: req.body,
    include: productInclude,
  });
  return success(res, 200, "Product updated successfully", updated);
});

// Soft delete: keeps OrderItem FK references intact (onDelete: Restrict)
// and preserves order history. To re-enable, PUT { isActive: true }.
const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "Product not found");

  if (!existing.isActive) {
    return error(res, 400, "Product is already inactive");
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: productInclude,
  });
  return success(res, 200, "Product deactivated successfully", updated);
});

module.exports = { list, getOne, create, update, remove };
