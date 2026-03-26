const prisma = require("../prisma");

/**
 * checkExist({
 *  model: "user",
 * field: "userId",
 * column: "id"
 * })
 */
const checkExist = ({ model, field, column = "id" }) => {
  return async (req, res, next) => {
    try {
      const value = req.body[field];

      if (!value) return next();
      const record = await prisma[model].findFirst({
        where: { [column]: value },
      });
      if (!record) {
        return res.status(404).json({
          success: false,
          message: `${model} with ${column} ${value} does not exist`,
        });
      }
      next();
    } catch (error) {
      console.error("checkExist error:", error);
      return res.status(500).json({
        success: false,
        message: "Database validation error",
      });
    }
  };
};


module.exports = checkExist;