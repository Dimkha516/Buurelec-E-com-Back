const prisma = require("../utils/prisma");

const CASUAL_NAME = "Casual";

// Returns the "Casual" fallback supplier, creating it if missing. Used as the
// default when the admin creates a product without picking a supplier.
const getCasualSupplier = async () => {
  return prisma.supplier.upsert({
    where: { name: CASUAL_NAME },
    update: {},
    create: {
      name: CASUAL_NAME,
      notes: "Default supplier for products with no specific source",
    },
  });
};

const isCasualSupplier = (supplier) => supplier?.name === CASUAL_NAME;

module.exports = { getCasualSupplier, isCasualSupplier, CASUAL_NAME };
