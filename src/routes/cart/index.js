"use strict";
const { authenticationV2 } = require("../../auth/authUtils");

const express = require("express");
const cartController = require("../../controllers/cart.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

//create new product
router.post("", asyncHandler(cartController.addToCart));
router.post("/update", asyncHandler(cartController.updateCart));
router.delete("", asyncHandler(cartController.deleteItemCart));
router.get("", asyncHandler(cartController.getListUserCart));

module.exports = router;
