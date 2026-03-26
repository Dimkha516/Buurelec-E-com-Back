const prisma = require("../prisma");
const { error } = require("./apiResponse");

/**
 * Vérifie l'unicité d'un ou plusieurs champs
 * @param {string} model - nom du modèle Prisma
 * @param {string[]} fields - Champs à vérifier
 * @param {string} source - body | params | query (par défaut body)
 */

module.exports = (model, fields, source = "body") => {
  return async (req, res, next) => {
    for (const field of fields) {
      const value = req[source]?.[field];

      if (!value) continue;

      const exists = await prisma[model].findFirst({
        where: {
          [field]: value,
        },
      });

      if (exists) {
        return error(res, 409, `${field} already exists`);
      }
    }
    next();
  };
};
