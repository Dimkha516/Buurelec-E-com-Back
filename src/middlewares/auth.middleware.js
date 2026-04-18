const { verifyAccessToken } = require("../utils/jwt");
const { error } = require("../utils/apiResponse");

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return error(res, 401, "Authentication required");
  }
  const token = header.slice(7).trim();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch (_) {
    return error(res, 401, "Invalid or expired token");
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return error(res, 401, "Authentication required");
    if (roles.length && !roles.includes(req.user.role)) {
      return error(res, 403, "Insufficient permissions");
    }
    return next();
  };
};

module.exports = { authenticate, authorize };
