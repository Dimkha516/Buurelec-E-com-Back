// Dependances require:
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Using
const app = express();

// .env Variables:
const baseUrl = process.env.BACKEND_BASIC_URL;
const PORT = process.env.PORT;

// Middlewares:
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // !origin autorise les requêtes sans Origin (Postman, curl, health checks serveur-à-serveur)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origine non autorisée par CORS : ${origin}`));
      }
    },
    credentials: true,
  }),
);
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   }),
// );


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Rate Limiting:
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // 100 request per IP
// });
// app.use(`${baseUrl}`, limiter);

app.use(`${baseUrl}`, (req, res, next) => next());

// ROUTES CALLING:
const authRouter = require("./src/routes/auth.routes");
const usersRouter = require("./src/routes/user.routes");
const addressesRouter = require("./src/routes/address.routes");
const categoriesRouter = require("./src/routes/category.routes");
const brandsRouter = require("./src/routes/brand.routes");
const productsRouter = require("./src/routes/product.routes");
const productImagesRouter = require("./src/routes/productImage.routes");
const productFeaturesRouter = require("./src/routes/productFeature.routes");
const reviewsRouter = require("./src/routes/review.routes");
const cartsRouter = require("./src/routes/cart.routes");
const myCartRouter = require("./src/routes/myCart.routes");
const cartItemsRouter = require("./src/routes/cartItem.routes");
const ordersRouter = require("./src/routes/order.routes");
const myOrderRouter = require("./src/routes/myOrder.routes");
const checkoutRouter = require("./src/routes/checkout.routes");
const orderItemsRouter = require("./src/routes/orderItem.routes");
const pickupPointsRouter = require("./src/routes/pickupPoint.routes");
const wishlistItemsRouter = require("./src/routes/wishlistItem.routes");
const wishlistRouter = require("./src/routes/wishlist.routes");
const dealsRouter = require("./src/routes/deal.routes");
const dealProductsRouter = require("./src/routes/dealProduct.routes");
const bannersRouter = require("./src/routes/banner.routes");
const newsletterSubscribersRouter = require("./src/routes/newsletterSubscriber.routes");
const contactMessagesRouter = require("./src/routes/contactMessage.routes");

// ADMIN ROUTES:
const adminOrdersRouter = require("./src/routes/admin/order.routes");
const adminProductsRouter = require("./src/routes/admin/product.routes");
const adminBrandsRouter = require("./src/routes/admin/brand.routes");
const adminCategoriesRouter = require("./src/routes/admin/category.routes");
const adminPickupPointsRouter = require("./src/routes/admin/pickupPoint.routes");
const adminUsersRouter = require("./src/routes/admin/user.routes");
const adminBannersRouter = require("./src/routes/admin/banner.routes");
const adminDealsRouter = require("./src/routes/admin/deal.routes");

// ROUTES USE:
app.use(`${baseUrl}/auth`, authRouter);
app.use(`${baseUrl}/users`, usersRouter);
app.use(`${baseUrl}/addresses`, addressesRouter);
app.use(`${baseUrl}/categories`, categoriesRouter);
app.use(`${baseUrl}/brands`, brandsRouter);
app.use(`${baseUrl}/products`, productsRouter);
app.use(`${baseUrl}/product-images`, productImagesRouter);
app.use(`${baseUrl}/product-features`, productFeaturesRouter);
app.use(`${baseUrl}/reviews`, reviewsRouter);
app.use(`${baseUrl}/carts`, cartsRouter);
app.use(`${baseUrl}/cart`, myCartRouter);
app.use(`${baseUrl}/cart-items`, cartItemsRouter);
app.use(`${baseUrl}/orders`, ordersRouter);
app.use(`${baseUrl}/my-orders`, myOrderRouter);
app.use(`${baseUrl}/checkout`, checkoutRouter);
app.use(`${baseUrl}/order-items`, orderItemsRouter);
app.use(`${baseUrl}/pickup-points`, pickupPointsRouter);
app.use(`${baseUrl}/wishlist-items`, wishlistItemsRouter);
app.use(`${baseUrl}/wishlist`, wishlistRouter);
app.use(`${baseUrl}/deals`, dealsRouter);
app.use(`${baseUrl}/deal-products`, dealProductsRouter);
app.use(`${baseUrl}/banners`, bannersRouter);
app.use(`${baseUrl}/newsletter-subscribers`, newsletterSubscribersRouter);
app.use(`${baseUrl}/contact-messages`, contactMessagesRouter);

// ADMIN MOUNTS:
app.use(`${baseUrl}/admin/orders`, adminOrdersRouter);
app.use(`${baseUrl}/admin/products`, adminProductsRouter);
app.use(`${baseUrl}/admin/brands`, adminBrandsRouter);
app.use(`${baseUrl}/admin/categories`, adminCategoriesRouter);
app.use(`${baseUrl}/admin/pickup-points`, adminPickupPointsRouter);
app.use(`${baseUrl}/admin/users`, adminUsersRouter);
app.use(`${baseUrl}/admin/banners`, adminBannersRouter);
app.use(`${baseUrl}/admin/deals`, adminDealsRouter);

// CLOSING LINE: Run Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
