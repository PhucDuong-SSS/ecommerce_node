"use strict";
const { authenticationV2 } = require("../../auth/authUtils");

const express = require("express");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

router.get(
  "/search/:keySearch",
  asyncHandler(productController.searchProducts)
);

//authenticate
router.use(authenticationV2);

//create new product
router.post("", asyncHandler(productController.createNewProduct));
router.post(
  "/publish/:id",
  asyncHandler(productController.publishProductByShop)
);
router.post(
  "/unPublish/:id",
  asyncHandler(productController.unPublishProductByShop)
);

router.get("/drafts/all", asyncHandler(productController.findAllDraftForShop));
router.get(
  "/publish/all",
  asyncHandler(productController.findAllPublishForShop)
);

module.exports = router;
