const prisma = require("../utils/prisma");

const SINGLETON_ID = "singleton";

// Always returns the singleton settings row. Creates it on first read with
// schema defaults; safe to call from any controller without null-checking.
const getSettings = async () => {
  return prisma.siteSetting.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
};

const updateSettings = async (data) => {
  return prisma.siteSetting.upsert({
    where: { id: SINGLETON_ID },
    update: data,
    create: { id: SINGLETON_ID, ...data },
  });
};

module.exports = { getSettings, updateSettings, SINGLETON_ID };
