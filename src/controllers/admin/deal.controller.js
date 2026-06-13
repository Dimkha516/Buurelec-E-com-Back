const prisma = require("../../utils/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const { success, error } = require("../../utils/apiResponse");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const dealInclude = {
  products: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          stock: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      },
    },
  },
  _count: { select: { products: true } },
};

const SORTABLE_FIELDS = ["createdAt", "startDate", "endDate", "title"];

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
      { startDate: { lte: now } },
      { endDate: { gte: now } },
    ];
  }

  return where;
};

const validateDateOrder = (merged) => {
  if (!merged.startDate || !merged.endDate) return null;
  if (new Date(merged.endDate) <= new Date(merged.startDate)) {
    return "endDate must be after startDate";
  }
  return null;
};

// ===== Deal CRUD =====

const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT),
  );
  const skip = (page - 1) * limit;

  const sortField = SORTABLE_FIELDS.includes(req.query.sortBy)
    ? req.query.sortBy
    : "startDate";
  const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

  const where = buildListFilters(req.query);

  const [records, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      skip,
      take: limit,
      include: { _count: { select: { products: true } } },
      orderBy: { [sortField]: sortOrder },
    }),
    prisma.deal.count({ where }),
  ]);

  return success(res, 200, "Deals list", {
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
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: dealInclude,
  });
  if (!deal) return error(res, 404, "Deal not found");
  return success(res, 200, "Deal retrieved successfully", deal);
});

const create = asyncHandler(async (req, res) => {
  const deal = await prisma.deal.create({
    data: req.body,
    include: dealInclude,
  });
  return success(res, 201, "Deal created successfully", deal);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "Deal not found");

  const dateError = validateDateOrder({ ...existing, ...req.body });
  if (dateError) return error(res, 400, dateError);

  const updated = await prisma.deal.update({
    where: { id },
    data: req.body,
    include: dealInclude,
  });
  return success(res, 200, "Deal updated successfully", updated);
});

// Hard delete: DealProduct rows cascade away automatically
const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "Deal not found");

  await prisma.deal.delete({ where: { id } });
  return success(res, 200, "Deal deleted successfully");
});

// ===== Deal Products (nested) =====

const addProduct = asyncHandler(async (req, res) => {
  const { id: dealId } = req.params;
  const { productId, dealPrice } = req.body;

  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) return error(res, 404, "Deal not found");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return error(res, 404, "Product not found");

  const existingLink = await prisma.dealProduct.findUnique({
    where: { dealId_productId: { dealId, productId } },
  });
  if (existingLink) {
    return error(res, 409, "Product is already part of this deal");
  }

  const link = await prisma.dealProduct.create({
    data: { dealId, productId, dealPrice },
    include: { product: { select: { id: true, name: true, slug: true, price: true } } },
  });
  return success(res, 201, "Product added to deal successfully", link);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id: dealId, productId } = req.params;
  const { dealPrice } = req.body;

  const link = await prisma.dealProduct.findUnique({
    where: { dealId_productId: { dealId, productId } },
  });
  if (!link) return error(res, 404, "Product is not part of this deal");

  const updated = await prisma.dealProduct.update({
    where: { dealId_productId: { dealId, productId } },
    data: { dealPrice },
    include: { product: { select: { id: true, name: true, slug: true, price: true } } },
  });
  return success(res, 200, "Deal product updated successfully", updated);
});

const removeProduct = asyncHandler(async (req, res) => {
  const { id: dealId, productId } = req.params;

  const link = await prisma.dealProduct.findUnique({
    where: { dealId_productId: { dealId, productId } },
  });
  if (!link) return error(res, 404, "Product is not part of this deal");

  await prisma.dealProduct.delete({
    where: { dealId_productId: { dealId, productId } },
  });
  return success(res, 200, "Product removed from deal successfully");
});

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  addProduct,
  updateProduct,
  removeProduct,
};
