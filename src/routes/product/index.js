"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

//create new product
router.post("", asyncHandler(productController.createNewProduct));

module.exports = router;
