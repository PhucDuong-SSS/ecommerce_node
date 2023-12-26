"use strict";

const ProductService = require("../services/product.service");
const ProductService2 = require("../services/product.service.xxx");
const { SuccessResponse } = require("../core/success.response");

class ProductController {
  createNewProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Product created successfully",
      metadata: await ProductService2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req?.user?.userId,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
