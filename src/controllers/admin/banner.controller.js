const prisma = require("../../utils/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const { success, error } = require("../../utils/apiResponse");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const SORTABLE_FIELDS = ["sortOrder", "title", "createdAt", "startDate"];

const buildListFilters = (query) => {
  const where = {};

  if (query.search) {
    where.title = { contains: query.search, mode: "insensitive" };
  }
  if (query.isActive === "true") where.isActive = true;
  else if (query.isActive === "false") where.isActive = false;

  if (query.currentlyActive === "true") {
    const now = new Date();
    where.AND = [
      { isActive: true },
      { OR: [{ startDate: null }, { startDate: { lte: now } }] },
      { OR: [{ endDate: null }, { endDate: { gte: now } }] },
    ];
  }

  return where;
};

// Validate that startDate <= endDate for a merged payload (existing + incoming).
const validateDateOrder = (merged) => {
  if (!merged.startDate || !merged.endDate) return null;
  if (new Date(merged.endDate) <= new Date(merged.startDate)) {
    return "endDate must be after startDate";
  }
  return null;
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
    prisma.banner.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: sortOrder },
    }),
    prisma.banner.count({ where }),
  ]);

  return success(res, 200, "Banners list", {
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
  const { id } = req.params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) return error(res, 404, "Banner not found");
  return success(res, 200, "Banner retrieved successfully", banner);
});

const create = asyncHandler(async (req, res) => {
  const dateError = validateDateOrder(req.body);
  if (dateError) return error(res, 400, dateError);

  const banner = await prisma.banner.create({ data: req.body });
  return success(res, 201, "Banner created successfully", banner);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "Banner not found");

  const dateError = validateDateOrder({ ...existing, ...req.body });
  if (dateError) return error(res, 400, dateError);

  const updated = await prisma.banner.update({
    where: { id },
    data: req.body,
  });
  return success(res, 200, "Banner updated successfully", updated);
});

// Hard delete: no FK references
const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "Banner not found");

  await prisma.banner.delete({ where: { id } });
  return success(res, 200, "Banner deleted successfully");
});

module.exports = { list, getOne, create, update, remove };
