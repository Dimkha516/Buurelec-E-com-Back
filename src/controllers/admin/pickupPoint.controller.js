const prisma = require("../../utils/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const { success, error } = require("../../utils/apiResponse");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const pickupPointInclude = {
  _count: { select: { orders: true } },
};

const SORTABLE_FIELDS = ["createdAt", "name", "city"];

const buildListFilters = (query) => {
  const where = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { address: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.city) {
    where.city = { equals: query.city, mode: "insensitive" };
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
    prisma.pickupPoint.findMany({
      where,
      skip,
      take: limit,
      include: pickupPointInclude,
      orderBy: { [sortField]: sortOrder },
    }),
    prisma.pickupPoint.count({ where }),
  ]);

  return success(res, 200, "Pickup points list", {
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
  const pickupPoint = await prisma.pickupPoint.findUnique({
    where: { id },
    include: pickupPointInclude,
  });
  if (!pickupPoint) return error(res, 404, "Pickup point not found");
  return success(res, 200, "Pickup point retrieved successfully", pickupPoint);
});

const create = asyncHandler(async (req, res) => {
  const pickupPoint = await prisma.pickupPoint.create({
    data: req.body,
    include: pickupPointInclude,
  });
  return success(res, 201, "Pickup point created successfully", pickupPoint);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.pickupPoint.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "Pickup point not found");

  const updated = await prisma.pickupPoint.update({
    where: { id },
    data: req.body,
    include: pickupPointInclude,
  });
  return success(res, 200, "Pickup point updated successfully", updated);
});

// Soft delete: Order.pickupPointId is SetNull, but inactive pickup points are
// already filtered out at checkout. Soft-deleting keeps the reference intact
// for in-flight orders (customers still see where to pick up).
const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.pickupPoint.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "Pickup point not found");

  if (!existing.isActive) {
    return error(res, 400, "Pickup point is already inactive");
  }

  const updated = await prisma.pickupPoint.update({
    where: { id },
    data: { isActive: false },
    include: pickupPointInclude,
  });
  return success(res, 200, "Pickup point deactivated successfully", updated);
});

module.exports = { list, getOne, create, update, remove };
