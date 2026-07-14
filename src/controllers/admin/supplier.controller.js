const prisma = require("../../utils/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const { success, error } = require("../../utils/apiResponse");
const {
  getCasualSupplier,
  isCasualSupplier,
  CASUAL_NAME,
} = require("../../services/supplierService");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const supplierInclude = {
  _count: { select: { products: true } },
};

const SORTABLE_FIELDS = ["createdAt", "name", "city"];

const buildListFilters = (query) => {
  const where = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { contactPerson: { contains: query.search, mode: "insensitive" } },
      { contactEmail: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.city) {
    where.city = { equals: query.city, mode: "insensitive" };
  }
  if (query.country) {
    where.country = { equals: query.country, mode: "insensitive" };
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
    prisma.supplier.findMany({
      where,
      skip,
      take: limit,
      include: supplierInclude,
      orderBy: { [sortField]: sortOrder },
    }),
    prisma.supplier.count({ where }),
  ]);

  return success(res, 200, "Suppliers list", {
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
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: supplierInclude,
  });
  if (!supplier) return error(res, 404, "Supplier not found");
  return success(res, 200, "Supplier retrieved successfully", supplier);
});

const create = asyncHandler(async (req, res) => {
  const supplier = await prisma.supplier.create({
    data: req.body,
    include: supplierInclude,
  });
  return success(res, 201, "Supplier created successfully", supplier);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "Supplier not found");

  // Prevent renaming the Casual supplier away — code paths rely on the name.
  if (
    isCasualSupplier(existing) &&
    req.body.name &&
    req.body.name !== CASUAL_NAME
  ) {
    return error(res, 400, `The "${CASUAL_NAME}" supplier cannot be renamed`);
  }

  // Uniqueness check excluding self
  if (req.body.name && req.body.name !== existing.name) {
    const dup = await prisma.supplier.findFirst({
      where: { name: req.body.name, NOT: { id } },
    });
    if (dup) return error(res, 409, "name already exists");
  }

  const updated = await prisma.supplier.update({
    where: { id },
    data: req.body,
    include: supplierInclude,
  });
  return success(res, 200, "Supplier updated successfully", updated);
});

// Delete a supplier: reassign all its products to the Casual supplier first,
// then delete. Casual itself cannot be deleted.
const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "Supplier not found");

  if (isCasualSupplier(existing)) {
    return error(res, 400, `The "${CASUAL_NAME}" supplier cannot be deleted`);
  }

  const casual = await getCasualSupplier();

  await prisma.$transaction(async (tx) => {
    await tx.product.updateMany({
      where: { supplierId: id },
      data: { supplierId: casual.id },
    });
    await tx.supplier.delete({ where: { id } });
  });

  return success(
    res,
    200,
    `Supplier deleted successfully; its products were reassigned to "${CASUAL_NAME}"`,
  );
});

module.exports = { list, getOne, create, update, remove };
