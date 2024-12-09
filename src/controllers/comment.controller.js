"use strict";

const {
  createComment,
  getCommentByParentId,
} = require("../services/comment.service");
const { SuccessResponse } = require("../core/success.response");

class CommentController {
  createComment = async (req, res, next) => {
    new SuccessResponse({
      message: "Comment created",
      metadata: await createComment(req.body),
    }).send(res);
  };

  getCommentByParentId = async (req, res, next) => {
    new SuccessResponse({
      message: "get comments by parent id",
      metadata: await getCommentByParentId(req.query),
    }).send(res);
  };
}

module.exports = new CommentController();
