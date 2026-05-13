const prisma = require("../../utils/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const { success, error } = require("../../utils/apiResponse");
const { sendEmail } = require("../../services/mailService");
const orderConfirmedTemplate = require("../../templates/orderConfirmedTemplate");
const orderShippedTemplate = require("../../templates/orderShippedTemplate");
const orderDeliveredTemplate = require("../../templates/orderDeliveredTemplate");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const orderInclude = {
  user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
  shippingAddress: true,
  billingAddress: true,
  pickupPoint: true,
  items: { include: { product: { include: { images: true } } } },
};

// Whitelist of legal status transitions an admin can perform.
// Anything not listed is rejected (e.g. SHIPPED -> CONFIRMED is impossible).
const ALLOWED_TRANSITIONS = {
  confirm: { from: "PENDING", to: "CONFIRMED" },
  process: { from: "CONFIRMED", to: "PROCESSING" },
  ship: { from: "PROCESSING", to: "SHIPPED" },
  deliver: { from: "SHIPPED", to: "DELIVERED" },
};

const sendStatusEmail = (action, order) => {
  if (!order.user?.email) return;

  const templates = {
    confirm: {
      subject: `Votre commande ${order.orderNumber} a été validée`,
      render: orderConfirmedTemplate,
    },
    ship: {
      subject: `Votre commande ${order.orderNumber} a été expédiée`,
      render: orderShippedTemplate,
    },
    deliver: {
      subject: `Votre commande ${order.orderNumber} a été livrée`,
      render: orderDeliveredTemplate,
    },
  };

  const tpl = templates[action];
  if (!tpl) return;

  sendEmail({
    to: order.user.email,
    subject: tpl.subject,
    html: tpl.render({ user: order.user, order }),
  }).catch((e) => console.error(`Order ${action} email failed:`, e));
};

const transitionOrder = (action) =>
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const transition = ALLOWED_TRANSITIONS[action];

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return error(res, 404, "Order not found");

    if (order.status !== transition.from) {
      return error(
        res,
        400,
        `Cannot ${action} order at status ${order.status} (expected ${transition.from})`,
      );
    }

    const updateData = { status: transition.to };
    if (transition.to === "SHIPPED") updateData.shippedAt = new Date();
    if (transition.to === "DELIVERED") updateData.deliveredAt = new Date();

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: orderInclude,
    });

    sendStatusEmail(action, updated);

    return success(res, 200, `Order ${transition.to.toLowerCase()} successfully`, updated);
  });

const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  const where = {};
  if (req.query.status) where.status = req.query.status;

  const [records, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  return success(res, 200, "Orders list", {
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
  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });
  if (!order) return error(res, 404, "Order not found");
  return success(res, 200, "Order retrieved successfully", order);
});

module.exports = {
  list,
  getOne,
  confirm: transitionOrder("confirm"),
  process: transitionOrder("process"),
  ship: transitionOrder("ship"),
  deliver: transitionOrder("deliver"),
};
