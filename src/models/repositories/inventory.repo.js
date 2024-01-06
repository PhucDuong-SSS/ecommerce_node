"use strict";

const { inventory } = require("../inventory.model");
const { Types } = require("mongoose");

const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = "unknown",
}) => {
  return await inventory.create({
    inven_productId: new Types.ObjectId(productId),
    inven_stock: stock,
    inven_shopId: new Types.ObjectId(shopId),
    inven_location: location,
  });
};

module.exports = {
  insertInventory,
};
