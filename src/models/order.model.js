"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Orders";
const COLLECTION_NAME = "orders";
const orderSchema = new Schema(
  {
    order_userId: { type: Number, required: true },
    order_checkout: { type: Object, required: true },
    /**
     * order_checkout: {
     *  totalPrice,
     *  totalApplyDiscount,
     *  freeShip
     * }
     */
    order_shipping: { type: Object, required: true },
    /**
     * order_shipping: {
     *  street,
     *  city,
     * state,
     *  country
     * }
     */
    order_payment: { type: Object, default: {} },
    order_products: { type: Array, required: true },
    order_tracking: { type: String, default: "#000011052002" },
    order_status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "canceled", "delivered"],
      default: "pending",
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: {
      createAt: "createdOn",
      updateAt: "modifiedOn",
    },
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, orderSchema);
