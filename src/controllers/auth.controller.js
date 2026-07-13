const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/apiResponse");
const {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} = require("../utils/jwt");
const { sendEmail } = require("../services/mailService");
const welcomeTemplate = require("../templates/welcomeTemplate");

const SALT_ROUNDS = 10;

const sanitizeUser = (user) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

exports.register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  // if (existing) return error(res, 409, "Email already registered");
  if (existing) return error(res, 409, "Email déjà pris");

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const mailing = await sendEmail({
    to: email,
    subject: "Bienvenue",
    html: welcomeTemplate(firstName),
  });

  if(!mailing.success) {
    return res.status(500).json({
      message: "Erreur envoi mail",
      error: mailing.error
    })
  }
  
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, phone },
  });

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user.id);

  return success(res, 201, "User registered successfully", {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  // if (!user) return error(res, 401, "Invalid credentials");
  if (!user) return error(res, 401, "Identifiants invalides");
  // if (!user.isActive) return error(res, 403, "Account is disabled");
  if (!user.isActive) return error(res, 403, "Compte désactivé");

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  // if (!isMatch) return error(res, 401, "Invalid credentials");
  if (!isMatch) return error(res, 401, "Identifiants invalides");

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const accessToken = signAccessToken(updated);
  const refreshToken = await issueRefreshToken(updated.id);

  return success(res, 200, "Login successful", {
    user: sanitizeUser(updated),
    accessToken,
    refreshToken,
  });
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const { userId, token } = await rotateRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      return error(res, 401, "Invalid refresh token");
    }
    const accessToken = signAccessToken(user);
    return success(res, 200, "Token refreshed", {
      accessToken,
      refreshToken: token,
    });
  } catch (_) {
    return error(res, 401, "Invalid or expired refresh token");
  }
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) await revokeRefreshToken(refreshToken);
  return success(res, 200, "Logged out");
});

exports.verifyAdmin = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !user.isActive) return error(res, 401, "Account not found or disabled");
  if (user.role !== "ADMIN") return error(res, 403, "Admin access required");
  return success(res, 200, "Admin verified", {
    isAdmin: true,
    user: sanitizeUser(user),
  });
});
