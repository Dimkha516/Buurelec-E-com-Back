// Fields on Product that must NEVER be exposed to customers or the public
// (cost price, internal supplier link). Admin endpoints keep full access.
const PUBLIC_PRODUCT_OMIT = { buyPrice: true, supplierId: true };

// Reusable Prisma nested-relation shapes for public/customer-facing reads.
const publicProduct = { omit: PUBLIC_PRODUCT_OMIT };
const publicProductWithImages = {
  omit: PUBLIC_PRODUCT_OMIT,
  include: { images: true },
};

module.exports = {
  PUBLIC_PRODUCT_OMIT,
  publicProduct,
  publicProductWithImages,
};
