"use strict";

const DiscountService = require("../services/discount.service");
const { SuccessResponse } = require("../core/success.response");

class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "discount code created successfully",
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req?.user?.userId,
      }),
    }).send(res);
  };

  getAllDiscountCodeByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "get all discount codes by shop",
      metadata: await DiscountService.getAllDiscountCodeByShopId({
        ...req.query,
      }),
    }).send(res);
  };

  getAllProductWithDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "get discount codes by shop id",
      metadata: await DiscountService.getAllProductWithDiscountCode({
        ...req.query,
      }),
    }).send(res);
  };

  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "get discount amount",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  };
}

module.exports = new DiscountController();
