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

  /**
   * @desc Get all draff for shop
   * @param {Number} limit
   * @param {Number} skip
   * @param {Number} product_shop
   *
   * @return {JSON}
   */

  findAllDraftForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "find all draft for shop",
      metadata: await ProductService2.findAllDraftForShop(req?.user?.userId),
    }).send(res);
  };

  findAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "find all draft for shop",
      metadata: await ProductService2.findAllPublishForShop(req?.user?.userId),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "publish Product By Shop successfully",
      metadata: await ProductService2.publishProductByShop({
        product_id: req.params.id,
        product_shop: req?.user?.userId,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "unPublish Product By Shop successfully",
      metadata: await ProductService2.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req?.user?.userId,
      }),
    }).send(res);
  };

  searchProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "get search list",
      metadata: await ProductService2.searchProducts(req.params),
    }).send(res);
  };
}

module.exports = new ProductController();
