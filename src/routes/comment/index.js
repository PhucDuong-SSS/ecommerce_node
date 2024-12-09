"use strict";
const { authenticationV2 } = require("../../auth/authUtils");

const express = require("express");
const commentController = require("../../controllers/comment.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

//authenticate
router.use(authenticationV2);

router.post("", asyncHandler(commentController.createComment));
router.get("", asyncHandler(commentController.getCommentByParentId));

module.exports = router;
