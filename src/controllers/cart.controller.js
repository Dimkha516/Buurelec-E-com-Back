const crudController = require("./crud.controller");
const prisma = require("../utils/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/apiResponse");

const base = crudController("cart");

const cartInclude = {
  items: {
    include: {
      product: { include: { images: true } },
    },
    orderBy: { createdAt: "asc" },
  },
};

const getOrCreateCart = (userId) =>
  prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: cartInclude,
  });

const getMyCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  return success(res, 200, "Cart retrieved successfully", cart);
});

const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return error(res, 404, "Product not found");
  if (!product.isActive) return error(res, 400, "Product is not available");

  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const item = await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity },
    update: { quantity: { increment: quantity } },
    include: { product: { include: { images: true } } },
  });

  return success(res, 201, "Product added to cart", item);
});

const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return error(res, 404, "Cart not found");

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  if (!existing) return error(res, 404, "Product not in cart");

  await prisma.cartItem.delete({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  return success(res, 200, "Product removed from cart");
});

module.exports = { ...base, getMyCart, addToCart, removeFromCart };
