"use strict";

const { BadRequestError } = require("../core/error.response");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");
const order = require("../models/order.model");
// chua logins
/**
 *{
    cartId,
    userId,
    shop_order_ids: [
        {
            shopId,
            shop_discounts :[
                {
                    shopId,
                    discountId,
                    productId
                }
            ],
            item_products: [
                {
                rice,  1000 
                quantity, 2
                productId
                }
            ]
        }
    ]
 }
 */
class CheckoutService {
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    // check cartId co ton tai hay ko

    const cartFound = await findCartById(cartId);

    if (!cartFound) {
      throw new BadRequestError("cart not found");
    }

    const checkout_order = {
      totalPrice: 0, // tong tien hang
      freeShip: 0, // phi van chuyen
      totalDiscount: 0, // tong discount giam gia
      totalCheckout: 0, // tong thanh toan
    };

    const shop_order_ids_news = [];

    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
      } = shop_order_ids[i];
      // check product avaible

      const checkProductService = await checkProductByServer(item_products);
      console.log([checkProductService]);

      if (!checkProductService[0]) {
        throw new BadRequestError("order wrong");
      }
      // tong tien
      const checkoutPrice = checkProductService.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);
      // tong tien trc khi su ly
      checkout_order.totalPrice += checkoutPrice;

      const item_checkout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // tien truoc gia gia
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductService,
      };

      // neu shop_discount ton tai >0, check xem hop le ko
      if (shop_discounts.length > 0) {
        // chi co 1 discount
        const { discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductService,
        });

        // tond discount giam gia
        checkout_order.totalDiscount += discount;
        if (discount > 0) {
          item_checkout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      // tong thanh toan
      checkout_order.totalCheckout += item_checkout.priceApplyDiscount;
      shop_order_ids_news.push(checkout_order);
    }

    return {
      shop_order_ids,
      shop_order_ids_news,
      checkout_order,
    };
  }

  static async orderUser({
    shop_order_ids_news,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.checkoutReview({
        cartId,
        userId,
        shop_order_ids: shop_order_ids_news,
      });

    //check lai mot lan nua xem vuot ton kho khong
    // get new Array products
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    const acquireProducts = [];
    // optimitic clocking  : khoa bi quan
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProducts.push(keyLock ? true : false);

      if (keyLock) {
        await releaseLock(keyLock);
      }
    }
    // check lai neu co mot san pham het hang
    if (acquireProducts.includes(false)) {
      throw new BadRequestError(
        "Mot so san pham da cap nhat, vui long quay lai gio hang"
      );
    }

    const newOrder = await order.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_news,
    });

    // insert thanh cong remove product trong gio hang
    if (newOrder) {
    }
    return newOrder;
  }

  /**
   *  1 query order user
   */

  static async getOrdersByUser() {}
  /**
   *  1 query get one order user
   */

  static async getOneOrderByUser() {}
  /**
   *  1 cancel  order user
   */

  static async cancelOrderByUser() {}
  /**
   *  update status
   */

  static async updateStatusOrderByShop() {}
}

module.exports = CheckoutService;
