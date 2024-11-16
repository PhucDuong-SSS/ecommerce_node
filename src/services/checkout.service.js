"use strict";

const { BadRequestError } = require("../core/error.response");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
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

    const shop_order_ids_new = [];

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
      shop_order_ids_new.push(checkout_order);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }
}

module.exports = CheckoutService;
