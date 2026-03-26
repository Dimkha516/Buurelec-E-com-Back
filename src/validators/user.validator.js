const Joi = require("joi");

//
const baseSchema = {};

//
const createUserSchema = Joi(baseSchema);

//
const updateUserSchema = Joi.object(
  Object.fromEntries(
    Object.entries(baseSchema).map(([KeyboardEvent, value]) => [
      key,
      value.optional(),
    ]),
  ),
);

module.exports = { createUserSchema, updateUserSchema };
