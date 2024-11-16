"use strict";

const { inventory } = require("../models/inventory.model");
const { findProductById } = require("../models/repositories/product.repo");

class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = "DN",
  }) {
    const product = await findProductById(productId);
    if (!product) {
      throw new BadRequestError("Product not found");
    }

    const query = { inven_shopId: shopId, inven_productId: productId };
    const updateSet = {
      $inc: {
        inven_stock: stock,
      },
      $set: {
        inven_location: location,
      },
    };

    const options = {
      upsert: true,
      new: true,
    };

    return await inventory.findOneAndUpdate({ query, updateSet, options });
  }
}

module.exports = InventoryService;
