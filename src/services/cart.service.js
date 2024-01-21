"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const cart = require("../models/cart.model");

const {
  findAllProducts,
  findProductById,
} = require("../models/repositories/product.repo");
const { convertToObjectIdMongodb } = require("../utils");

/**
 * cart service implementation
 * 1 . add product to cart user
 * 2 . increase product count
 * 3 . reduce product quantity
 * 4 . get cart
 * 5 . delete all cart
 *  6 . delete item from cart
 */

class CartService {
  static async createUserCart({ userId, product }) {
    const query = { cart_UserId: userId, cart_state: "active" },
      updateOrInsert = {
        $addToSet: {
          cart_products: product,
        },
      },
      options = { upsert: true, new: true };

    return await cart.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;

    const query = {
      cart_UserId: userId,
      "cart_products.productId": productId,
      cart_state: "active",
    };

    const updateSet = {
      $inc: {
        "cart_products.$.quantity": quantity,
      },
    };

    const options = {
      upsert: true,
      new: true,
    };

    return await cart.findOneAndUpdate(query, updateSet, options);
  }

  static async addToCart({ userId, product }) {
    const foundCart = await cart.findOne({ cart_UserId: userId });
    if (!foundCart) {
      // create new cart
      return await CartService.createUserCart({ userId, product });
    }

    //neu co gio hang nhung chua co sp

    if (!foundCart.cart_products.length) {
      foundCart.cart_products = [product];
      return await foundCart.save();
    }

    //gio hang ton tai thi + len
    return await CartService.updateUserCartQuantity({ userId, product });
  }

  /**
   * shop_order_ids : [
   * {
   *  shopId
   * item_product: [
   * {
   *  quantity,
   * price,
   * shopId,
   * oldQuantity
   * productId
   * version
   *
   * }]
   * }
   *
   * ]
   */
  static async updateCartV2({ userId, shopOrderIds = [] }) {
    const { productId, quantity, oldQuantity } = shopOrderIds[0].itemProducts;
    // check product co ton tai hay khong
    const foundProduct = await findProductById(productId);
    if (!foundProduct) {
      throw new NotFoundError("Product not found");
    }
    // compare
    if (foundProduct.product_shop.toString() !== shopOrderIds[0]?.shopId) {
      throw new NotFoundError("Product is not shop");
    }

    if (quantity === 0) {
      return await CartService.deleteUserCart({ userId, productId });
    }

    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - oldQuantity,
      },
    });
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cart_UserId: userId, cart_state: "active" };
    const updateSet = {
      $pull: {
        cart_products: {
          productId,
        },
      },
    };

    const deleteCart = await cart.updateOne(query, updateSet);

    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cart
      .findOne({
        cart_UserId: +userId,
      })
      .lean();
  }
}

module.exports = CartService;
