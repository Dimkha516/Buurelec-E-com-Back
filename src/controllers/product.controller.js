const crudController = require("./crud.controller");
const { PUBLIC_PRODUCT_OMIT } = require("../utils/publicViews");

// Public product endpoint must NEVER expose cost price (buyPrice) or the
// internal supplier link (supplierId). Admin routes have their own controller.
module.exports = crudController("product", { omit: PUBLIC_PRODUCT_OMIT });
