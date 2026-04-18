const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// ── Helpers ─────────────────────────────────────────────────────────────────
const badgeMap = { Sale: "SALE", Hot: "HOT", New: "NEW" };
const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

// ── Front mocked catalog (mirrored from Buurelec-E-com-Front/front/src/data/products.js) ──
const frontCategories = [
  { name: "Smartphones", slug: "smartphones", icon: "Smartphone", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop" },
  { name: "Laptops", slug: "laptops", icon: "Laptop", imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop" },
  { name: "Headphones", slug: "headphones", icon: "Headphones", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop" },
  { name: "Cameras", slug: "cameras", icon: "Camera", imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop" },
  { name: "Televisions", slug: "televisions", icon: "Tv", imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop" },
  { name: "Gaming", slug: "gaming", icon: "Gamepad2", imageUrl: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=300&h=300&fit=crop" },
  { name: "Tablets", slug: "tablets", icon: "Tablet", imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop" },
  { name: "Accessories", slug: "accessories", icon: "Watch", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop" },
];

const frontBrands = [
  { name: "Apple", slug: "apple" },
  { name: "Samsung", slug: "samsung" },
  { name: "Sony", slug: "sony" },
  { name: "LG", slug: "lg" },
  { name: "Dell", slug: "dell" },
  { name: "Nintendo", slug: "nintendo" },
  { name: "Microsoft", slug: "microsoft" },
  { name: "Google", slug: "google" },
];

const frontProducts = [
  {
    name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", categorySlug: "smartphones", brandSlug: "apple",
    price: 1199, originalPrice: 1399, badge: "Sale", stock: 25, isFeatured: true,
    description: "The most powerful iPhone ever with A17 Pro chip, titanium design, and a 48MP camera system.",
    features: ["A17 Pro Chip", "48MP Camera", "Titanium Design", "USB-C", "Action Button"],
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop",
    ],
  },
  {
    name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra", categorySlug: "smartphones", brandSlug: "samsung",
    price: 1099, originalPrice: 1299, badge: "Hot", stock: 30, isFeatured: true,
    description: "Galaxy AI powers your creativity with the ultimate ultra experience.",
    features: ["Snapdragon 8 Gen 3", "200MP Camera", "S Pen", "Galaxy AI", "Titanium Frame"],
    images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop"],
  },
  {
    name: 'MacBook Pro 16" M3 Max', slug: "macbook-pro-16-m3-max", categorySlug: "laptops", brandSlug: "apple",
    price: 2499, originalPrice: null, badge: "New", stock: 12, isFeatured: true,
    description: "The most powerful MacBook Pro ever with M3 Max chip and stunning Liquid Retina XDR display.",
    features: ["M3 Max Chip", "36GB RAM", "1TB SSD", "Liquid Retina XDR", "22h Battery"],
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop"],
  },
  {
    name: "Sony WH-1000XM5", slug: "sony-wh-1000xm5", categorySlug: "headphones", brandSlug: "sony",
    price: 349, originalPrice: 399, badge: "Sale", stock: 60, isFeatured: false,
    description: "Industry-leading noise cancellation with exceptional sound quality.",
    features: ["30h Battery", "Multipoint", "LDAC", "Speak-to-Chat", "Adaptive Sound"],
    images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&h=500&fit=crop"],
  },
  {
    name: "Sony Alpha A7 IV", slug: "sony-alpha-a7-iv", categorySlug: "cameras", brandSlug: "sony",
    price: 2498, originalPrice: 2699, badge: null, stock: 8, isFeatured: false,
    description: "Full-frame mirrorless camera with advanced autofocus and 4K video capabilities.",
    features: ["33MP Sensor", "4K 60fps", "Real-time AF", "10fps Burst", "IBIS"],
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop"],
  },
  {
    name: 'LG OLED C3 65"', slug: "lg-oled-c3-65", categorySlug: "televisions", brandSlug: "lg",
    price: 1799, originalPrice: 2499, badge: "Sale", stock: 15, isFeatured: true,
    description: "Stunning OLED display with perfect blacks and vibrant colors for an immersive viewing experience.",
    features: ["4K OLED", "120Hz", "Dolby Vision", "webOS", "Gaming Mode"],
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=500&fit=crop"],
  },
  {
    name: "PlayStation 5", slug: "playstation-5", categorySlug: "gaming", brandSlug: "sony",
    price: 499, originalPrice: null, badge: "Hot", stock: 40, isFeatured: true,
    description: "Experience lightning-fast loading, deeper immersion with haptic feedback, and a new generation of games.",
    features: ["4K Gaming", "Ray Tracing", "DualSense", "825GB SSD", "120fps Support"],
    images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=500&fit=crop"],
  },
  {
    name: 'iPad Pro 12.9" M2', slug: "ipad-pro-12-9-m2", categorySlug: "tablets", brandSlug: "apple",
    price: 1099, originalPrice: 1199, badge: "New", stock: 22, isFeatured: false,
    description: "Supercharged by M2. With breakthrough performance and next-level display.",
    features: ["M2 Chip", "Liquid Retina XDR", "Apple Pencil", "Face ID", "Thunderbolt"],
    images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop"],
  },
  {
    name: "Apple Watch Ultra 2", slug: "apple-watch-ultra-2", categorySlug: "accessories", brandSlug: "apple",
    price: 799, originalPrice: 849, badge: "Sale", stock: 35, isFeatured: false,
    description: "The most rugged and capable Apple Watch with precision dual-frequency GPS.",
    features: ["S9 Chip", "36h Battery", "Titanium", "Depth Gauge", "Action Button"],
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop"],
  },
  {
    name: "Dell XPS 15", slug: "dell-xps-15", categorySlug: "laptops", brandSlug: "dell",
    price: 1599, originalPrice: 1899, badge: "Sale", stock: 18, isFeatured: false,
    description: "Stunning InfinityEdge display with powerful performance for creators.",
    features: ["Intel i9", "32GB RAM", "RTX 4070", "OLED 3.5K", "Thunderbolt 4"],
    images: ["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&h=500&fit=crop"],
  },
  {
    name: "AirPods Pro 2", slug: "airpods-pro-2", categorySlug: "headphones", brandSlug: "apple",
    price: 249, originalPrice: null, badge: null, stock: 100, isFeatured: false,
    description: "Rebuilt from the sound up with H2 chip, Active Noise Cancellation, and Adaptive Transparency.",
    features: ["H2 Chip", "ANC", "Adaptive Transparency", "USB-C", "Spatial Audio"],
    images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&h=500&fit=crop"],
  },
  {
    name: "Nintendo Switch OLED", slug: "nintendo-switch-oled", categorySlug: "gaming", brandSlug: "nintendo",
    price: 349, originalPrice: null, badge: null, stock: 50, isFeatured: false,
    description: "Vibrant 7-inch OLED screen with a wide adjustable stand and wired LAN port.",
    features: ['7" OLED', "64GB Storage", "Enhanced Audio", "Wide Stand", "LAN Port"],
    images: ["https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=500&h=500&fit=crop"],
  },
];

const frontBanners = [
  {
    title: "New Season Arrivals",
    subtitle: "Check out the latest electronics deals",
    buttonText: "Shop Now",
    buttonLink: "/products",
    bgColor: "from-primary to-secondary",
    imageUrl: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=400&fit=crop",
  },
  {
    title: "Up to 40% Off",
    subtitle: "On premium headphones & accessories",
    buttonText: "Explore Deals",
    buttonLink: "/categories/headphones",
    bgColor: "from-navy to-navy-light",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=400&fit=crop",
  },
  {
    title: "Gaming Paradise",
    subtitle: "Latest consoles and accessories",
    buttonText: "Game On",
    buttonLink: "/categories/gaming",
    bgColor: "from-accent to-warning",
    imageUrl: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=400&fit=crop",
  },
];

// Front "deals" are: products[3], products[5], products[9], products[8]
// → Sony WH-1000XM5, LG OLED C3 65", Dell XPS 15, Apple Watch Ultra 2
const frontDeals = [
  { productSlug: "sony-wh-1000xm5", endInDays: 2 },
  { productSlug: "lg-oled-c3-65", endInDays: 1 },
  { productSlug: "dell-xps-15", endInDays: 3 },
  { productSlug: "apple-watch-ultra-2", endInDays: 5 },
];

// ── Wipe all data (children before parents) ────────────────────────────────
async function wipeDatabase() {
  console.log("Wiping existing data...");
  await prisma.refreshToken.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.dealProduct.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productFeature.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.banner.deleteMany();
  console.log("Database wiped.");
}

async function main() {
  await wipeDatabase();
  console.log("\nSeeding database...");

  // ── USERS ──
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@buurelec.com", passwordHash,
        firstName: "Amadou", lastName: "Diallo", phone: "+221770000001",
        role: "ADMIN", emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "fatou@example.com", passwordHash,
        firstName: "Fatou", lastName: "Sow", phone: "+221770000002",
        role: "CUSTOMER", emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "moussa@example.com", passwordHash,
        firstName: "Moussa", lastName: "Ndiaye", phone: "+221770000003",
        role: "CUSTOMER", emailVerified: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "aissatou@example.com", passwordHash,
        firstName: "Aissatou", lastName: "Ba", phone: "+221770000004",
        role: "CUSTOMER", emailVerified: true,
      },
    }),
  ]);
  console.log(`Created ${users.length} users`);

  // ── ADDRESSES ──
  const addresses = await Promise.all([
    prisma.address.create({ data: { userId: users[0].id, label: "Bureau", firstName: "Amadou", lastName: "Diallo", street: "12 Rue Carnot", city: "Dakar", zipCode: "10000", country: "Sénégal", phone: "+221770000001", isDefault: true } }),
    prisma.address.create({ data: { userId: users[1].id, label: "Maison", firstName: "Fatou", lastName: "Sow", street: "45 Avenue Bourguiba", city: "Thiès", zipCode: "21000", country: "Sénégal", phone: "+221770000002", isDefault: true } }),
    prisma.address.create({ data: { userId: users[2].id, label: "Maison", firstName: "Moussa", lastName: "Ndiaye", street: "8 Boulevard de la République", city: "Saint-Louis", zipCode: "32000", country: "Sénégal", phone: "+221770000003", isDefault: true } }),
    prisma.address.create({ data: { userId: users[3].id, label: "Maison", firstName: "Aissatou", lastName: "Ba", street: "23 Rue Faidherbe", city: "Ziguinchor", zipCode: "27000", country: "Sénégal", phone: "+221770000004", isDefault: true } }),
  ]);
  console.log(`Created ${addresses.length} addresses`);

  // ── CATEGORIES (front) ──
  const categories = {};
  for (let i = 0; i < frontCategories.length; i++) {
    const c = frontCategories[i];
    const created = await prisma.category.create({
      data: {
        name: c.name, slug: c.slug, icon: c.icon, imageUrl: c.imageUrl,
        description: `${c.name} — products and accessories`,
        sortOrder: i + 1,
      },
    });
    categories[c.slug] = created;
  }
  console.log(`Created ${Object.keys(categories).length} categories`);

  // ── BRANDS (front) ──
  const brands = {};
  for (const b of frontBrands) {
    const created = await prisma.brand.create({ data: { name: b.name, slug: b.slug } });
    brands[b.slug] = created;
  }
  console.log(`Created ${Object.keys(brands).length} brands`);

  // ── PRODUCTS (front) ──
  const products = {};
  for (const p of frontProducts) {
    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        sku: p.slug.toUpperCase(),
        stock: p.stock,
        badge: p.badge ? badgeMap[p.badge] : null,
        isFeatured: p.isFeatured,
        categoryId: categories[p.categorySlug].id,
        brandId: brands[p.brandSlug].id,
      },
    });
    products[p.slug] = created;

    // Product images
    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: created.id,
          url: p.images[i],
          altText: `${p.name} image ${i + 1}`,
          isPrimary: i === 0,
          sortOrder: i,
        },
      });
    }

    // Product features
    for (let i = 0; i < p.features.length; i++) {
      await prisma.productFeature.create({
        data: {
          productId: created.id,
          name: p.features[i],
          sortOrder: i,
        },
      });
    }
  }
  console.log(`Created ${Object.keys(products).length} products (with images & features)`);

  // ── REVIEWS (sample, linked to new products) ──
  const reviews = await Promise.all([
    prisma.review.create({ data: { productId: products["iphone-15-pro-max"].id, userId: users[1].id, rating: 5, title: "Excellent phone", comment: "Camera and battery are amazing!" } }),
    prisma.review.create({ data: { productId: products["iphone-15-pro-max"].id, userId: users[2].id, rating: 4, title: "Great but pricey", comment: "Worth it if you can afford it." } }),
    prisma.review.create({ data: { productId: products["samsung-galaxy-s24-ultra"].id, userId: users[3].id, rating: 5, title: "Best Android", comment: "Galaxy AI features are fantastic." } }),
    prisma.review.create({ data: { productId: products["macbook-pro-16-m3-max"].id, userId: users[1].id, rating: 5, title: "Powerhouse", comment: "Handles every workload effortlessly." } }),
    prisma.review.create({ data: { productId: products["sony-wh-1000xm5"].id, userId: users[2].id, rating: 5, title: "Best ANC", comment: "Noise cancellation is unmatched." } }),
    prisma.review.create({ data: { productId: products["playstation-5"].id, userId: users[3].id, rating: 5, title: "Next-gen gaming", comment: "DualSense feedback is a game changer." } }),
  ]);
  console.log(`Created ${reviews.length} reviews`);

  // ── CARTS ──
  const carts = await Promise.all([
    prisma.cart.create({ data: { userId: users[0].id } }),
    prisma.cart.create({ data: { userId: users[1].id } }),
    prisma.cart.create({ data: { userId: users[2].id } }),
    prisma.cart.create({ data: { userId: users[3].id } }),
  ]);
  console.log(`Created ${carts.length} carts`);

  // ── CART ITEMS ──
  const cartItems = await Promise.all([
    prisma.cartItem.create({ data: { cartId: carts[1].id, productId: products["iphone-15-pro-max"].id, quantity: 1 } }),
    prisma.cartItem.create({ data: { cartId: carts[1].id, productId: products["airpods-pro-2"].id, quantity: 2 } }),
    prisma.cartItem.create({ data: { cartId: carts[2].id, productId: products["samsung-galaxy-s24-ultra"].id, quantity: 1 } }),
    prisma.cartItem.create({ data: { cartId: carts[3].id, productId: products["dell-xps-15"].id, quantity: 1 } }),
  ]);
  console.log(`Created ${cartItems.length} cart items`);

  // ── ORDERS ──
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: "BUR-20260401-001", userId: users[1].id, status: "DELIVERED",
        subtotal: 1199, shippingCost: 20, taxAmount: 0, totalAmount: 1219,
        shippingAddressId: addresses[1].id, billingAddressId: addresses[1].id,
        paymentMethod: "Orange Money", paymentStatus: "PAID",
        paidAt: new Date("2026-03-20"), deliveredAt: new Date("2026-03-25"),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "BUR-20260401-002", userId: users[2].id, status: "SHIPPED",
        subtotal: 2499, shippingCost: 30, taxAmount: 0, totalAmount: 2529,
        shippingAddressId: addresses[2].id, paymentMethod: "Wave", paymentStatus: "PAID",
        paidAt: new Date("2026-03-28"), shippedAt: new Date("2026-03-30"),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "BUR-20260401-003", userId: users[3].id, status: "PENDING",
        subtotal: 499, shippingCost: 15, taxAmount: 0, totalAmount: 514,
        shippingAddressId: addresses[3].id, paymentMethod: "Carte bancaire", paymentStatus: "PENDING",
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "BUR-20260401-004", userId: users[1].id, status: "CANCELLED",
        subtotal: 249, shippingCost: 10, taxAmount: 0, totalAmount: 259,
        shippingAddressId: addresses[1].id, paymentMethod: "Orange Money", paymentStatus: "REFUNDED",
        cancelledAt: new Date("2026-03-15"),
      },
    }),
  ]);
  console.log(`Created ${orders.length} orders`);

  // ── ORDER ITEMS ──
  const orderItems = await Promise.all([
    prisma.orderItem.create({ data: { orderId: orders[0].id, productId: products["iphone-15-pro-max"].id, productName: "iPhone 15 Pro Max", unitPrice: 1199, quantity: 1, totalPrice: 1199 } }),
    prisma.orderItem.create({ data: { orderId: orders[1].id, productId: products["macbook-pro-16-m3-max"].id, productName: 'MacBook Pro 16" M3 Max', unitPrice: 2499, quantity: 1, totalPrice: 2499 } }),
    prisma.orderItem.create({ data: { orderId: orders[2].id, productId: products["playstation-5"].id, productName: "PlayStation 5", unitPrice: 499, quantity: 1, totalPrice: 499 } }),
    prisma.orderItem.create({ data: { orderId: orders[3].id, productId: products["airpods-pro-2"].id, productName: "AirPods Pro 2", unitPrice: 249, quantity: 1, totalPrice: 249 } }),
  ]);
  console.log(`Created ${orderItems.length} order items`);

  // ── WISHLIST ITEMS ──
  const wishlistItems = await Promise.all([
    prisma.wishlistItem.create({ data: { userId: users[1].id, productId: products["samsung-galaxy-s24-ultra"].id } }),
    prisma.wishlistItem.create({ data: { userId: users[1].id, productId: products["macbook-pro-16-m3-max"].id } }),
    prisma.wishlistItem.create({ data: { userId: users[2].id, productId: products["iphone-15-pro-max"].id } }),
    prisma.wishlistItem.create({ data: { userId: users[3].id, productId: products["lg-oled-c3-65"].id } }),
  ]);
  console.log(`Created ${wishlistItems.length} wishlist items`);

  // ── DEALS (front flash deals) ──
  const deals = [];
  for (const d of frontDeals) {
    const product = products[d.productSlug];
    const deal = await prisma.deal.create({
      data: {
        title: `Flash Deal — ${product.name}`,
        description: `Limited-time offer on ${product.name}`,
        startDate: new Date(),
        endDate: daysFromNow(d.endInDays),
        isActive: true,
      },
    });
    await prisma.dealProduct.create({
      data: { dealId: deal.id, productId: product.id, dealPrice: product.price },
    });
    deals.push(deal);
  }
  console.log(`Created ${deals.length} deals (with deal products)`);

  // ── BANNERS (front) ──
  const banners = [];
  for (let i = 0; i < frontBanners.length; i++) {
    const b = frontBanners[i];
    banners.push(
      await prisma.banner.create({
        data: { ...b, sortOrder: i, isActive: true },
      })
    );
  }
  console.log(`Created ${banners.length} banners`);

  // ── NEWSLETTER SUBSCRIBERS ──
  const newsletterSubs = await Promise.all([
    prisma.newsletterSubscriber.create({ data: { email: "fatou@example.com", userId: users[1].id } }),
    prisma.newsletterSubscriber.create({ data: { email: "aissatou@example.com", userId: users[3].id } }),
    prisma.newsletterSubscriber.create({ data: { email: "oumar@example.com" } }),
    prisma.newsletterSubscriber.create({ data: { email: "mariama@example.com" } }),
  ]);
  console.log(`Created ${newsletterSubs.length} newsletter subscribers`);

  // ── CONTACT MESSAGES ──
  const contactMessages = await Promise.all([
    prisma.contactMessage.create({ data: { userId: users[1].id, name: "Fatou Sow", email: "fatou@example.com", subject: "Question sur ma commande", message: "Bonjour, je voudrais savoir où en est ma commande BUR-20260401-001.", status: "REPLIED", repliedAt: new Date("2026-03-22") } }),
    prisma.contactMessage.create({ data: { name: "Ibrahima Fall", email: "ibrahima@example.com", subject: "Retour produit", message: "Je souhaite retourner un produit défectueux.", status: "READ" } }),
    prisma.contactMessage.create({ data: { userId: users[2].id, name: "Moussa Ndiaye", email: "moussa@example.com", subject: "Problème de paiement", message: "Mon paiement Wave n'a pas été confirmé.", status: "UNREAD" } }),
    prisma.contactMessage.create({ data: { name: "Awa Diop", email: "awa@example.com", subject: "Partenariat", message: "Nous souhaitons proposer nos produits sur votre plateforme.", status: "ARCHIVED" } }),
  ]);
  console.log(`Created ${contactMessages.length} contact messages`);

  // ── REFRESH TOKENS ──
  const refreshTokens = await Promise.all([
    prisma.refreshToken.create({ data: { token: "seed-token-user1-001", userId: users[0].id, expiresAt: new Date("2026-05-01") } }),
    prisma.refreshToken.create({ data: { token: "seed-token-user2-001", userId: users[1].id, expiresAt: new Date("2026-05-01") } }),
    prisma.refreshToken.create({ data: { token: "seed-token-user3-001", userId: users[2].id, expiresAt: new Date("2026-05-01") } }),
    prisma.refreshToken.create({ data: { token: "seed-token-user4-001", userId: users[3].id, expiresAt: new Date("2026-05-01") } }),
  ]);
  console.log(`Created ${refreshTokens.length} refresh tokens`);

  console.log("\nSeeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
