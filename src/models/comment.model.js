"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Comment";
const COLLECTION_NAME = "Comments";
// Declare the Schema of the Mongo model
const commentSchema = new Schema(
  {
    comment_productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    comment_userId: {
      type: Number,
      default: 1,
    },
    comment_content: {
      type: String,
      default: "text",
    },
    comment_left: {
      type: Number,
      default: 0,
    },
    comment_right: {
      type: Number,
      default: 0,
    },
    comment_parentid: {
      type: Schema.Types.ObjectId,
      ref: DOCUMENT_NAME,
    },
    idDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, commentSchema);
