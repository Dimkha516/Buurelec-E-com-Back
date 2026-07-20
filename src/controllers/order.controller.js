const crudController = require("./crud.controller");
const prisma = require("../utils/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/apiResponse");
const { sendEmail } = require("../services/mailService");
const { getSettings } = require("../services/settingsService");
const { reverseGeocodeToAddress } = require("../services/geocodingService");
const orderConfirmationTemplate = require("../templates/orderConfirmationTemplate");
const orderCancellationTemplate = require("../templates/orderCancellationTemplate");
const { publicProductWithImages } = require("../utils/publicViews");

const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED"];

const base = crudController("order");

const resolveShippingCost = async (deliveryMethod) => {
  const settings = await getSettings();
  if (deliveryMethod === "HOME_DELIVERY") return Number(settings.homeDeliveryCost);
  if (deliveryMethod === "PICKUP_POINT") return Number(settings.pickupDeliveryCost);
  return 0;
};

const orderInclude = {
  shippingAddress: true,
  billingAddress: true,
  pickupPoint: true,
  items: { include: { product: publicProductWithImages } },
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
  // return `BUR-${datePart}-${String(count + 1).padStart(3, "0")}`;
  return `SO-${datePart}-${String(count + 1).padStart(3, "0")}`;
};

const checkout = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    deliveryMethod,
    shippingAddressId,
    coordinates,
    pickupPointId,
    paymentMethod,
    paymentTiming,
    deliveryDate,
    notes,
  } = req.body;

  // 0. Load user (for email + as the owner of a location-based address)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  });

  // 1. Load cart with items
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) {
    return error(res, 400, "Your cart is empty");
  }

  // 2. Validate delivery target belongs to / exists.
  // For home delivery the customer either picks a saved address or shares
  // their current location (coordinates), which we reverse-geocode here.
  let geocodedAddress = null;
  if (deliveryMethod === "HOME_DELIVERY") {
    if (coordinates) {
      try {
        geocodedAddress = await reverseGeocodeToAddress(
          coordinates.latitude,
          coordinates.longitude,
        );
      } catch (e) {
        return error(res, e.statusCode || 502, e.message);
      }
    } else {
      const address = await prisma.address.findFirst({
        where: { id: shippingAddressId, userId },
      });
      if (!address) {
        return error(res, 404, "Shipping address not found");
      }
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
  const shippingCost = await resolveShippingCost(deliveryMethod);
  const totalAmount = subtotal + shippingCost;

  // 5. Generate order number
  const orderNumber = await generateOrderNumber();

  // 6. Create order + items + decrement stock + clear cart in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Persist a new address for the shared current location, otherwise reuse
    // the saved address the customer selected.
    let finalShippingAddressId = null;
    if (deliveryMethod === "HOME_DELIVERY") {
      if (geocodedAddress) {
        const addr = await tx.address.create({
          data: {
            userId,
            label: "Position actuelle",
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone || null,
            street: geocodedAddress.street,
            city: geocodedAddress.city,
            state: geocodedAddress.state,
            zipCode: geocodedAddress.zipCode,
            country: geocodedAddress.country,
          },
        });
        finalShippingAddressId = addr.id;
      } else {
        finalShippingAddressId = shippingAddressId;
      }
    }

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
        shippingAddressId: finalShippingAddressId,
        billingAddressId: finalShippingAddressId,
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

const guestCheckout = asyncHandler(async (req, res) => {
  const {
    items,
    guest,
    deliveryMethod,
    address,
    coordinates,
    pickupPointId,
    paymentMethod,
    paymentTiming,
    deliveryDate,
    notes,
  } = req.body;

  // 1. Fetch products in one query and build a map
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  // 2. Validate each item
  for (const item of items) {
    const product = productMap[item.productId];
    if (!product) {
      return error(res, 404, `Product ${item.productId} not found`);
    }
    if (!product.isActive) {
      return error(res, 400, `Product "${product.name}" is no longer available`);
    }
    if (product.stock < item.quantity) {
      return error(
        res,
        400,
        `Insufficient stock for "${product.name}" (available: ${product.stock})`,
      );
    }
  }

  // 3. Verify pickup point if applicable
  if (deliveryMethod === "PICKUP_POINT") {
    const pp = await prisma.pickupPoint.findUnique({
      where: { id: pickupPointId },
    });
    if (!pp || !pp.isActive) {
      return error(res, 404, "Pickup point not available");
    }
  }

  // 3b. For home delivery, resolve the shipping address: either the typed
  // address or the shared current location (reverse-geocoded here).
  let deliveryAddress = address || null;
  if (deliveryMethod === "HOME_DELIVERY" && coordinates) {
    try {
      deliveryAddress = await reverseGeocodeToAddress(
        coordinates.latitude,
        coordinates.longitude,
      );
    } catch (e) {
      return error(res, e.statusCode || 502, e.message);
    }
  }

  // 4. Compute totals
  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(productMap[item.productId].price) * item.quantity,
    0,
  );
  const shippingCost = await resolveShippingCost(deliveryMethod);
  const totalAmount = subtotal + shippingCost;

  // 5. Generate order number
  const orderNumber = await generateOrderNumber();

  // 6. Create address (if HOME_DELIVERY) + order + items + decrement stock in a transaction
  const order = await prisma.$transaction(async (tx) => {
    let shippingAddressId = null;
    if (deliveryMethod === "HOME_DELIVERY") {
      const addr = await tx.address.create({
        data: {
          userId: null,
          label: coordinates ? "Position actuelle" : null,
          firstName: guest.firstName,
          lastName: guest.lastName,
          phone: guest.phone,
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          zipCode: deliveryAddress.zipCode,
          country: deliveryAddress.country,
          state: deliveryAddress.state || null,
        },
      });
      shippingAddressId = addr.id;
    }

    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: null,
        guestEmail: guest.email,
        guestFirstName: guest.firstName,
        guestLastName: guest.lastName,
        guestPhone: guest.phone,
        status: "PENDING",
        subtotal,
        shippingCost,
        taxAmount: 0,
        totalAmount,
        deliveryMethod,
        shippingAddressId,
        billingAddressId: shippingAddressId,
        pickupPointId: deliveryMethod === "PICKUP_POINT" ? pickupPointId : null,
        paymentMethod,
        paymentTiming,
        paymentStatus: "PENDING",
        deliveryDate: new Date(deliveryDate),
        notes: notes || null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: productMap[item.productId].name,
            unitPrice: productMap[item.productId].price,
            quantity: item.quantity,
            totalPrice:
              Number(productMap[item.productId].price) * item.quantity,
          })),
        },
      },
      include: orderInclude,
    });

    await Promise.all(
      items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    );

    return created;
  });

  // 7. Fire-and-forget confirmation email
  sendEmail({
    to: guest.email,
    subject: `Confirmation de commande ${order.orderNumber}`,
    html: orderConfirmationTemplate({
      user: { firstName: guest.firstName, email: guest.email },
      order,
    }),
  }).catch((e) => console.error("Guest order email failed:", e));

  return success(res, 201, "Order placed successfully", order);
});

// Public helper so the checkout page can preview the human-readable delivery
// address before placing the order (same normalization used at checkout).
const reverseGeocode = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    const address = await reverseGeocodeToAddress(latitude, longitude);
    return success(res, 200, "Location resolved successfully", address);
  } catch (e) {
    return error(res, e.statusCode || 502, e.message);
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orders = await prisma.order.findMany({
    where: { userId, status: { not: "CANCELLED" } },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return success(res, 200, "Orders retrieved successfully", orders);
});

const cancelOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: { items: true },
  });
  if (!order) return error(res, 404, "Order not found");

  if (order.status === "CANCELLED") {
    return error(res, 400, "Order is already cancelled");
  }
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return error(
      res,
      400,
      `Order cannot be cancelled at status ${order.status}`,
    );
  }

  const cancelled = await prisma.$transaction(async (tx) => {
    // Restore stock for each item
    await Promise.all(
      order.items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        }),
      ),
    );

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : order.paymentStatus,
      },
      include: orderInclude,
    });
  });

  // Send cancellation email (fire-and-forget)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true },
  });
  if (user) {
    sendEmail({
      to: user.email,
      subject: `Annulation de votre commande ${cancelled.orderNumber}`,
      html: orderCancellationTemplate({ user, order: cancelled }),
    }).catch((e) => console.error("Order cancellation email failed:", e));
  }

  return success(res, 200, "Order cancelled successfully", cancelled);
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

module.exports = {
  ...base,
  checkout,
  guestCheckout,
  reverseGeocode,
  getMyOrders,
  getMyOrder,
  cancelOrder,
};
