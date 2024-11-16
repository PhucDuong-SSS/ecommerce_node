"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const { discount } = require("../models/discount.model");
const {
  findAllDiscountCodeUnSelect,
  checkDiscountExits,
} = require("../models/repositories/discount.repo");
const { findAllProducts } = require("../models/repositories/product.repo");
const { convertToObjectIdMongodb } = require("../utils");

/**
 * discount service implementation
 * 1 . generate discount code (admin| shop)
 * 2 . get discount amount (user)
 * 3 . get all discount code (user| shop)
 * 4 . verify discount code (user)
 * 5 . delete discount code (admin| shop)
 *  6 . cancel discount code (user)
 */

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      value,
      startDate,
      endDate,
      isActive,
      shopId,
      minOrderValue,
      productIds,
      appliesTo,
      name,
      description,
      type,
      maxUsePerUser,
      userUsed,
      usesCount,
      maxUse,
    } = payload;

    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestError("start date must be before endDate");
    }

    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("discount code exist");
    }

    const newDiscount = discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: new Date(startDate),
      discount_end_date: new Date(endDate),
      discount_max_use: maxUse,
      discount_uses_count: usesCount,
      discount_user_used: userUsed,
      discount_max_use_per_user: maxUsePerUser,
      discount_min_order_value: minOrderValue || 0,
      discount_shopId: convertToObjectIdMongodb(shopId),
      discount_is_active: isActive,
      discount_applies_to: appliesTo,
      discount_product_ids: appliesTo === "all" ? [] : productIds,
    });

    return newDiscount;
  }

  static updateDiscountCode() {}

  /**
   * get list product with discount
   */

  static async getAllProductWithDiscountCode({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("discount not exist");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applies_to === "all") {
      products = await findAllProducts({
        filter: {
          product_shopId: convertToObjectIdMongodb(shopId),
          is_Publish: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          is_Publish: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    return products;
  }

  /**
   * get list discount code by shopId
   */

  static async getAllDiscountCodeByShopId({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodeUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true,
      },
      select: ["_id", "discount_code", "discount_name"],
      model: discount,
    });

    return discounts;
  }

  /**
   * apply discount code
   */

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExits({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) {
      throw new NotFoundError("discount not exist");
    }

    const {
      discount_is_active,
      discount_max_use,
      discount_min_order_value,
      discount_user_used,
      discount_type,
      discount_start_date,
      discount_end_date,
      discount_max_order_value,
      discount_value,
    } = foundDiscount;

    if (!discount_is_active) {
      throw new NotFoundError("discount expried");
    }

    if (discount_max_use === 0) {
      throw new NotFoundError("discount out of ");
    }

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new NotFoundError("discount code has expried ");
    }

    // check co set gia tri toi thieu hay khong
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(
          `discount require a min order value", ${discount_min_order_value}`
        );
      }
    }

    if (discount_max_order_value > 0) {
      const userDiscount = discount_user_used.find(
        (user) => user.userId === userId
      );

      if (userDiscount) {
        throw new NotFoundError(`user has use", ${userId}`);
      }
    }

    // check xem discount la fixed

    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deleteDisCount = await discount.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId),
    });

    return deleteDisCount;
  }

  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExits({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) {
      throw new NotFoundError(`not foundDiscount`);
    }

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_user_used: userId,
      },
      $inc: {
        discount_max_use: 1,
        discount_uses_count: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;
