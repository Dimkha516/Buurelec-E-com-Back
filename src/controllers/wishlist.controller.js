const prisma = require("../utils/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/apiResponse");

exports.getMyWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: { images: true, brand: true, category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return success(res, 200, "Wishlist retrieved successfully", items);
});

exports.addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return error(res, 404, "Product not found");

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existing) return error(res, 409, "Product already in wishlist");

  const item = await prisma.wishlistItem.create({
    data: { userId, productId },
    include: { product: { include: { images: true } } },
  });
  return success(res, 201, "Product added to wishlist", item);
});

exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (!existing) return error(res, 404, "Product not in wishlist");

  await prisma.wishlistItem.delete({
    where: { userId_productId: { userId, productId } },
  });
  return success(res, 200, "Product removed from wishlist");
});
