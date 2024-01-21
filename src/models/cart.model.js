"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Cart";
const COLLECTION_NAME = "carts";
const cartSchema = new Schema(
  {
    cart_state: {
      type: String,
      required: true,
      enum: ["completed", "active", "pending", "failed"],
      default: "active",
    },
    cart_products: {
      type: Array,
      required: true,
      default: [],
    },
    /**
     * [
     *  product: {
     *  productId,
     * shopId,
     * quantity,
     * name,price,
     * }
     * ]
     */
    cart_count_products: {
      type: Number,
      default: 0,
    },
    cart_UserId: {
      type: Number,
      required: true,
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
module.exports = model(DOCUMENT_NAME, cartSchema);
