const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("./prisma");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || "24h";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const signAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE },
  );

const verifyAccessToken = (token) => jwt.verify(token, JWT_SECRET);

const issueRefreshToken = async (userId) => {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  return token;
};

const rotateRefreshToken = async (oldToken) => {
  const record = await prisma.refreshToken.findUnique({ where: { token: oldToken } });
  if (!record) throw new Error("INVALID_REFRESH_TOKEN");
  if (record.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token: oldToken } });
    throw new Error("REFRESH_TOKEN_EXPIRED");
  }
  await prisma.refreshToken.delete({ where: { token: oldToken } });
  const newToken = await issueRefreshToken(record.userId);
  return { userId: record.userId, token: newToken };
};

const revokeRefreshToken = async (token) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};

module.exports = {
  signAccessToken,
  verifyAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
};
