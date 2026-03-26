const prisma = require("../prisma");

/**
 * Exemple d'utilisation :
 *
 * checkExistMultiple([
 *   { model: "user", field: "userId" },
 *   { model: "program", field: "programId" },
 *   { model: "course", field: "courseId", column: "id" }
 * ])
 *
 * @param {Array} checks
 */
const checkExistMultiple = (checks = []) => {
  return async (req, res, next) => {
    try {
      for (const check of checks) {
        const {
          model,
          field,
          column = "id",
          source = "body", // body | params | query
        } = check;

        const value = req[source]?.[field];

        // Si valeur absente on skip (utile pour update partiel)
        if (value === undefined || value === null) continue;

        const record = await prisma[model].findFirst({
          where: { [column]: value },
        });

        if (!record) {
          return res.status(404).json({
            success: false,
            message: `${model} with ${column} ${value} does not exist`,
          });
        }
      }

      next();
    } catch (error) {
      console.error("checkExistMultiple error:", error);

      return res.status(500).json({
        success: false,
        message: "Database validation error",
        error: error.message,
      });
    }
  };
};

module.exports = checkExistMultiple;
