"use strict";
const { authenticationV2 } = require("../../auth/authUtils");

const express = require("express");
const inventoryController = require("../../controllers/inventory.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

//authenticate
router.use(authenticationV2);

router.post("", asyncHandler(inventoryController.addStockToInventory));

module.exports = router;
