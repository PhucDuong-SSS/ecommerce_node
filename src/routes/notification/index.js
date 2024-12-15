"use strict";
const { authenticationV2 } = require("../../auth/authUtils");

const express = require("express");
const NotificationController = require("../../controllers/notification.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

//authenticate
router.use(authenticationV2);
//get list notification
router.get("", asyncHandler(NotificationController.listNotificationByUser));

module.exports = router;
