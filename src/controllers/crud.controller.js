// const prisma = require("../prisma");
const prisma = require("../utils/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/apiResponse");
const crudController = (model) => {
  return {
    // CREATE:
    create: asyncHandler(async (req, res) => {
      const record = await prisma[model].create({
        data: req.body,
      });
      success(res, 201, `${model} created successfully`, record);
    }),

    // GET_ALL:
    getAll: asyncHandler(async (req, res) => {
      const records = await prisma[model].findMany();
      success(res, 200, `${model} list`, records);
    }),

    // GET_BY_ID:
    getOne: asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      const record = await prisma[model].findUnique({
        where: { id },
      });
      if (!record) return error(res, 404, `${model} not found`);
      return success(res, 200, `${model} retrieved successfully`, record);
    }),

    // UPDATE:
    update: asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      const record = await prisma[model].update({
        where: { id },
        data: req.body,
      });
      return success(res, 200, `${model} updated successfully`, record);
    }),

    // DELETE:
    delete: asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      await prisma[model].delete({
        where: { id },
      });
      return success(res, 200, `${model} deleted successfully`);
    }),
  };
};

module.exports = crudController;
