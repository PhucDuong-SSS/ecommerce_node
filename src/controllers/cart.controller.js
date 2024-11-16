"use strict";

const CartService = require("../services/cart.service");
const { SuccessResponse } = require("../core/success.response");

class CartController {
  getListUserCart = async (req, res, next) => {
    new SuccessResponse({
      message: "get list cart",
      metadata: await CartService.getListUserCart(req.query),
    }).send(res);
  };

  /**
   * @desc add to cart
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "add card created successfully",
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  };

  updateCart = async (req, res, next) => {
    new SuccessResponse({
      message: "discount code created successfully",
      metadata: await CartService.updateCartV2(req.body),
    }).send(res);
  };

  deleteItemCart = async (req, res, next) => {
    new SuccessResponse({
      message: "discount code created successfully",
      metadata: await CartService.deleteUserCart(req.body),
    }).send(res);
  };
}

module.exports = new CartController();
