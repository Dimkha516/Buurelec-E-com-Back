const prisma = require("../utils/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/apiResponse");

// Relation includes par modèle
const modelIncludes = {
  user: {
    addresses: true,
    cart: true,
    orders: true,
    reviews: true,
    wishlistItems: true,
  },
  address: {
    user: { select: { id: true, firstName: true, lastName: true, email: true } },
  },
  category: {
    parent: true,
    children: true,
    products: true,
  },
  brand: {
    products: true,
  },
  product: {
    category: true,
    brand: true,
    images: true,
    features: true,
    reviews: true,
  },
  productImage: {
    product: { select: { id: true, name: true, slug: true } },
  },
  productFeature: {
    product: { select: { id: true, name: true, slug: true } },
  },
  review: {
    product: { select: { id: true, name: true, slug: true } },
    user: { select: { id: true, firstName: true, lastName: true } },
  },
  cart: {
    user: { select: { id: true, firstName: true, lastName: true, email: true } },
    items: { include: { product: true } },
  },
  cartItem: {
    cart: true,
    product: true,
  },
  order: {
    user: { select: { id: true, firstName: true, lastName: true, email: true } },
    shippingAddress: true,
    billingAddress: true,
    pickupPoint: true,
    items: { include: { product: { select: { id: true, name: true, slug: true } } } },
  },
  pickupPoint: {},
  orderItem: {
    order: { select: { id: true, orderNumber: true, status: true } },
    product: { select: { id: true, name: true, slug: true } },
  },
  wishlistItem: {
    user: { select: { id: true, firstName: true, lastName: true } },
    product: { include: { images: true } },
  },
  deal: {
    products: {
      include: {
        product: {
          include: {
            images: true,
            brand: true,
            category: true,
          },
        },
      },
    },
  },
  dealProduct: {
    deal: true,
    product: true,
  },
  newsletterSubscriber: {
    user: { select: { id: true, firstName: true, lastName: true, email: true } },
  },
  contactMessage: {
    user: { select: { id: true, firstName: true, lastName: true, email: true } },
  },
};

// Modèles sans createdAt — tri par défaut sur un autre champ
const defaultOrderBy = {
  productFeature: { sortOrder: "asc" },
  orderItem: { id: "asc" },
  dealProduct: { id: "asc" },
  newsletterSubscriber: { subscribedAt: "desc" },
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const crudController = (model, options = {}) => {
  const include = options.include ?? modelIncludes[model] ?? {};

  return {
    // CREATE:
    create: asyncHandler(async (req, res) => {
      const record = await prisma[model].create({
        data: req.body,
        include,
      });
      success(res, 201, `${model} created successfully`, record);
    }),

    // GET_ALL:
    getAll: asyncHandler(async (req, res) => {
      const page = Math.max(1, parseInt(req.query.page) || DEFAULT_PAGE);
      const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
      const skip = (page - 1) * limit;

      const [records, total] = await Promise.all([
        prisma[model].findMany({
          skip,
          take: limit,
          include,
          orderBy: defaultOrderBy[model] ?? { createdAt: "desc" },
        }),
        prisma[model].count(),
      ]);

      success(res, 200, `${model} list`, {
        data: records,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }),

    // GET_BY_ID_OR_SLUG:
    // Looks up a record by id; if not found (or the param isn't a valid id),
    // falls back to looking it up by slug for models that have one.
    getOne: asyncHandler(async (req, res) => {
      const param = req.params.id;
      let record = null;

      // Try by id first. Wrap in try/catch in case the param is not a valid
      // id format for the underlying column (e.g. UUID validation).
      try {
        record = await prisma[model].findUnique({
          where: { id: param },
          include,
        });
      } catch (_) {
        record = null;
      }

      // Fallback: try by slug. findFirst tolerates models without a slug field
      // by simply returning null when the where clause can't match.
      if (!record) {
        try {
          record = await prisma[model].findFirst({
            where: { slug: param },
            include,
          });
        } catch (_) {
          record = null;
        }
      }

      if (!record) return error(res, 404, `${model} not found`);
      return success(res, 200, `${model} retrieved successfully`, record);
    }),

    // UPDATE:
    update: asyncHandler(async (req, res) => {
      const id = req.params.id;
      const record = await prisma[model].update({
        where: { id },
        data: req.body,
        include,
      });
      return success(res, 200, `${model} updated successfully`, record);
    }),

    // DELETE:
    delete: asyncHandler(async (req, res) => {
      const id = req.params.id;
      await prisma[model].delete({
        where: { id },
      });
      return success(res, 200, `${model} deleted successfully`);
    }), 
  };
};

module.exports = crudController;
