"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

//sign up
router.post("/shop/singup", asyncHandler(accessController.signUp));
//login
router.post("/shop/login", asyncHandler(accessController.login));

//authenticate
router.use(authentication);

router.post("/shop/logout", asyncHandler(accessController.logout));

router.post(
  "/shop/handleRefreshToken",
  asyncHandler(accessController.handleRefreshToken)
);

module.exports = router;
