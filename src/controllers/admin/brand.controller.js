const prisma = require("../../utils/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const { success, error } = require("../../utils/apiResponse");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const brandInclude = {
  _count: { select: { products: true } },
};

const SORTABLE_FIELDS = ["createdAt", "name"];

const buildListFilters = (query) => {
  const where = {};

  if (query.search) {
    where.name = { contains: query.search, mode: "insensitive" };
  }
  if (query.isActive === "true") where.isActive = true;
  else if (query.isActive === "false") where.isActive = false;

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
    : "name";
  const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

  const where = buildListFilters(req.query);

  const [records, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      skip,
      take: limit,
      include: brandInclude,
      orderBy: { [sortField]: sortOrder },
    }),
    prisma.brand.count({ where }),
  ]);

  return success(res, 200, "Brands list", {
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
  let brand = null;

  try {
    brand = await prisma.brand.findUnique({
      where: { id: param },
      include: brandInclude,
    });
  } catch (_) {
    brand = null;
  }

  if (!brand) {
    try {
      brand = await prisma.brand.findFirst({
        where: { slug: param },
        include: brandInclude,
      });
    } catch (_) {
      brand = null;
    }
  }

  if (!brand) return error(res, 404, "Brand not found");
  return success(res, 200, "Brand retrieved successfully", brand);
});

const create = asyncHandler(async (req, res) => {
  const brand = await prisma.brand.create({
    data: req.body,
    include: brandInclude,
  });
  return success(res, 201, "Brand created successfully", brand);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "Brand not found");

  // Uniqueness check excluding self (name + slug)
  for (const field of ["name", "slug"]) {
    if (req.body[field] && req.body[field] !== existing[field]) {
      const dup = await prisma.brand.findFirst({
        where: { [field]: req.body[field], NOT: { id } },
      });
      if (dup) return error(res, 409, `${field} already exists`);
    }
  }

  const updated = await prisma.brand.update({
    where: { id },
    data: req.body,
    include: brandInclude,
  });
  return success(res, 200, "Brand updated successfully", updated);
});

// Hard delete: Product.brandId is onDelete:SetNull, so deleting a brand
// just unlinks its products. Safe.
const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "Brand not found");

  await prisma.brand.delete({ where: { id } });
  return success(res, 200, "Brand deleted successfully");
});

module.exports = { list, getOne, create, update, remove };
