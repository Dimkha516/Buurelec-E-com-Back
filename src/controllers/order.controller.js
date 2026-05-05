const crudController = require("./crud.controller");
const prisma = require("../utils/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/apiResponse");
const { sendEmail } = require("../services/mailService");
const orderConfirmationTemplate = require("../templates/orderConfirmationTemplate");

const base = crudController("order");

const SHIPPING_COSTS = {
  HOME_DELIVERY: 2000,
  PICKUP_POINT: 0,
};

const orderInclude = {
  shippingAddress: true,
  billingAddress: true,
  pickupPoint: true,
  items: { include: { product: { include: { images: true } } } },
};

const generateOrderNumber = async () => {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const count = await prisma.order.count({
    where: { createdAt: { gte: startOfDay, lt: endOfDay } },
  });
  return `BUR-${datePart}-${String(count + 1).padStart(3, "0")}`;
};

const checkout = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    deliveryMethod,
    shippingAddressId,
    pickupPointId,
    paymentMethod,
    paymentTiming,
    deliveryDate,
    notes,
  } = req.body;

  // 0. Load user (for email)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  // 1. Load cart with items
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) {
    return error(res, 400, "Your cart is empty");
  }

  // 2. Validate delivery target belongs to / exists
  if (deliveryMethod === "HOME_DELIVERY") {
    const address = await prisma.address.findFirst({
      where: { id: shippingAddressId, userId },
    });
    if (!address) {
      return error(res, 404, "Shipping address not found");
    }
  } else {
    const pickupPoint = await prisma.pickupPoint.findUnique({
      where: { id: pickupPointId },
    });
    if (!pickupPoint || !pickupPoint.isActive) {
      return error(res, 404, "Pickup point not available");
    }
  }

  // 3. Validate stock + active for every item
  for (const item of cart.items) {
    if (!item.product.isActive) {
      return error(res, 400, `Product "${item.product.name}" is no longer available`);
    }
    if (item.product.stock < item.quantity) {
      return error(
        res,
        400,
        `Insufficient stock for "${item.product.name}" (available: ${item.product.stock})`,
      );
    }
  }

  // 4. Compute totals
  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );
  const shippingCost = SHIPPING_COSTS[deliveryMethod] ?? 0;
  const totalAmount = subtotal + shippingCost;

  // 5. Generate order number
  const orderNumber = await generateOrderNumber();

  // 6. Create order + items + decrement stock + clear cart in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: "PENDING",
        subtotal,
        shippingCost,
        taxAmount: 0,
        totalAmount,
        deliveryMethod,
        shippingAddressId: deliveryMethod === "HOME_DELIVERY" ? shippingAddressId : null,
        billingAddressId: deliveryMethod === "HOME_DELIVERY" ? shippingAddressId : null,
        pickupPointId: deliveryMethod === "PICKUP_POINT" ? pickupPointId : null,
        paymentMethod,
        paymentTiming,
        paymentStatus: "PENDING",
        deliveryDate: new Date(deliveryDate),
        notes: notes || null,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            unitPrice: item.product.price,
            quantity: item.quantity,
            totalPrice: Number(item.product.price) * item.quantity,
          })),
        },
      },
      include: orderInclude,
    });

    await Promise.all(
      cart.items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    );

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return created;
  });

  // 7. Fire-and-forget email confirmation (don't fail the order if mail fails)
  sendEmail({
    to: user.email,
    subject: `Confirmation de commande ${order.orderNumber}`,
    html: orderConfirmationTemplate({ user, order }),
  }).catch((e) => console.error("Order confirmation email failed:", e));

  return success(res, 201, "Order placed successfully", order);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return success(res, 200, "Orders retrieved successfully", orders);
});

const getMyOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: orderInclude,
  });
  if (!order) return error(res, 404, "Order not found");
  return success(res, 200, "Order retrieved successfully", order);
});

module.exports = { ...base, checkout, getMyOrders, getMyOrder };
