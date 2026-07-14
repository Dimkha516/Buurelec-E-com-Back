const crudController = require("./crud.controller");
const prisma = require("../utils/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/apiResponse");
const { publicProduct, publicProductWithImages } = require("../utils/publicViews");

const base = crudController("user");

const sanitize = (user) => {
  if (!user) return user;
  const { passwordHash, ...rest } = user;
  return rest;
};

const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      addresses: true,
      cart: { include: { items: { include: { product: publicProduct } } } },
      orders: { orderBy: { createdAt: "desc" } },
      reviews: true,
      wishlistItems: { include: { product: publicProductWithImages } },
    },
  });
  if (!user) return error(res, 404, "User not found");
  return success(res, 200, "Profile retrieved successfully", sanitize(user));
});

module.exports = { ...base, getMe };
