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
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting:
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 request per IP
});
app.use(`${baseUrl}`, limiter);

// ROUTES CALLING:
const usersRouter = require("./src/routes/user.routes");

// ROUTES USE:
app.use(`${baseUrl}/users`, usersRouter);

// CLOSING LINE: Run Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
