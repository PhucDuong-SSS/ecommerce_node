"use strict";
const { authenticationV2 } = require("../../auth/authUtils");

const express = require("express");
const discountController = require("../../controllers/discount.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

//get discount amount
router.post("/amount", asyncHandler(discountController.getDiscountAmount));
router.get(
  "/list-product-code",
  asyncHandler(discountController.getAllProductWithDiscountCode)
);

//authenticate
router.use(authenticationV2);

//create new product
router.post("", asyncHandler(discountController.createDiscountCode));
router.get("", asyncHandler(discountController.getAllDiscountCodeByShop));

module.exports = router;
