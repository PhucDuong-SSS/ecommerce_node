"use strict";
const slugify = require("slugify");
const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const productSchema = Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_thumb: String,
    product_variations: { type: Array, default: [] },
    is_Draft: { type: Boolean, default: true, index: true, select: false },
    is_Publish: { type: Boolean, default: false, index: true, select: false },
    product_ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1"],
      max: [5, "Rating must be below 5"],
      set: (val) => Math.round(val * 10) / 10,
    },
    product_slug: String,
    product_description: String,
    product_price: {
      type: Number,
      required: true,
    },
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enums: ["Electronic", "Clothing", "Furniture"],
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//create index name, description product for search
productSchema.index({ product_name: "text", product_description: "text" });

//Middleware before save to add product slug
productSchema.pre("save", function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

// define the product by clothing
const clothingSchema = new Schema(
  {
    branch: {
      type: String,
      required: true,
    },
    size: { type: String },
    material: { type: String },
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
  },
  {
    timestamps: true,
    collection: "clothings",
  }
);

// define the product by electronic
const electronicSchema = new Schema(
  {
    manufacture: {
      type: String,
      required: true,
    },
    model: { type: String },
    color: { type: String },
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    timestamps: true,
    collection: " electronics",
  }
);

// define the product by furniture
const furnitureSchema = new Schema(
  {
    branch: {
      type: String,
      required: true,
    },
    size: { type: String },
    material: { type: String },
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
  },
  {
    timestamps: true,
    collection: " electronics",
  }
);

//Export the model
module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  electronic: model("electronic", electronicSchema),
  clothing: model("clothing", clothingSchema),
  furniture: model("furniture", clothingSchema),
};
