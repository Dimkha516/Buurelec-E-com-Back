const bcrypt = require("bcryptjs");
const prisma = require("../../utils/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const { success, error } = require("../../utils/apiResponse");

const SALT_ROUNDS = 10;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const SAFE_USER_FIELDS = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  role: true,
  isActive: true,
  emailVerified: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

const userListSelect = {
  ...SAFE_USER_FIELDS,
  _count: { select: { orders: true, addresses: true, reviews: true } },
};

const userDetailSelect = {
  ...SAFE_USER_FIELDS,
  addresses: true,
  orders: {
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      createdAt: true,
    },
  },
  _count: {
    select: {
      orders: true,
      addresses: true,
      reviews: true,
      wishlistItems: true,
    },
  },
};

const SORTABLE_FIELDS = ["createdAt", "lastLoginAt", "email", "firstName"];

const buildListFilters = (query) => {
  const where = {};

  if (query.search) {
    where.OR = [
      { email: { contains: query.search, mode: "insensitive" } },
      { firstName: { contains: query.search, mode: "insensitive" } },
      { lastName: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search } },
    ];
  }
  if (query.role) where.role = query.role;
  if (query.isActive === "true") where.isActive = true;
  else if (query.isActive === "false") where.isActive = false;
  if (query.emailVerified === "true") where.emailVerified = true;
  else if (query.emailVerified === "false") where.emailVerified = false;

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
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: userListSelect,
      orderBy: { [sortField]: sortOrder },
    }),
    prisma.user.count({ where }),
  ]);

  return success(res, 200, "Users list", {
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
  const user = await prisma.user.findUnique({
    where: { id },
    select: userDetailSelect,
  });
  if (!user) return error(res, 404, "User not found");
  return success(res, 200, "User retrieved successfully", user);
});

const create = asyncHandler(async (req, res) => {
  const { password, ...rest } = req.body;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { ...rest, passwordHash },
    select: SAFE_USER_FIELDS,
  });
  return success(res, 201, "User created successfully", user);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const meId = req.user.id;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "User not found");

  // Self-protection: don't lock yourself out
  if (id === meId) {
    if (req.body.role === "CUSTOMER" && existing.role === "ADMIN") {
      return error(res, 400, "You cannot demote yourself from ADMIN");
    }
    if (req.body.isActive === false && existing.isActive) {
      return error(res, 400, "You cannot deactivate your own account");
    }
  }

  // Email uniqueness excluding self
  if (req.body.email && req.body.email !== existing.email) {
    const dup = await prisma.user.findFirst({
      where: { email: req.body.email, NOT: { id } },
    });
    if (dup) return error(res, 409, "email already exists");
  }

  const data = { ...req.body };
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    delete data.password;
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: SAFE_USER_FIELDS,
  });

  // If the user was deactivated or password changed, revoke their refresh tokens
  // so existing sessions can't keep refreshing access tokens.
  const sessionRevokingChange =
    data.passwordHash !== undefined ||
    (data.isActive === false && existing.isActive);
  if (sessionRevokingChange) {
    await prisma.refreshToken.deleteMany({ where: { userId: id } });
  }

  return success(res, 200, "User updated successfully", updated);
});

// Soft delete: isActive=false + revoke refresh tokens.
// Order.userId is onDelete:Restrict, so we couldn't hard-delete a user
// with order history anyway.
const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const meId = req.user.id;

  if (id === meId) {
    return error(res, 400, "You cannot deactivate your own account");
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return error(res, 404, "User not found");

  if (!existing.isActive) return error(res, 400, "User is already inactive");

  const updated = await prisma.$transaction(async (tx) => {
    await tx.refreshToken.deleteMany({ where: { userId: id } });
    return tx.user.update({
      where: { id },
      data: { isActive: false },
      select: SAFE_USER_FIELDS,
    });
  });

  return success(res, 200, "User deactivated successfully", updated);
});

module.exports = { list, getOne, create, update, remove };
