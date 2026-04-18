const { error } = require("../utils/apiResponse");

module.exports = (schema, property = "body") => {
  return (req, res, next) => {
    const { error: validationError, value } = schema.validate(req[property], {
      abortEarly: true,
      stripUnknown: true,
    });
    if (validationError) {
      const messages = validationError.details.map((d) => d.message);
      return error(res, 400, messages.join(", "));
    }

    // Remplace req.body par les données validées.
    req[property] = value;
    next();
  };
};
 