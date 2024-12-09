"use strict";

const Comment = require("../models/comment.model");
const { convertToObjectIdMongodb } = require("../utils");

/**
 * add comment (user, shop)
 * get list comments user shop
 * delete comment
 */
class CommentService {
  static async createComment({ productId, userId, content, parentId = null }) {
    const comment = new Comment({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentId,
    });

    let rightValue;

    if (parentId) {
      const parentComment = await Comment.findOne({ parentId: parentId });
      if (parentComment) {
        throw new NotFoundError(
          `Comment parentComment ${parentComment} not Found`
        );
      }
      rightValue = parentComment.comment_right;

      // update many
      await Comment.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_right: { $gte: rightValue },
        },
        {
          $inc: { comment_right: 2 },
        }
      );

      await Comment.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_left: { $gt: rightValue },
        },
        {
          $inc: { comment_left: 2 },
        }
      );
    } else {
      const maxRightValue = await Comment.findOne(
        { comment_productId: convertToObjectIdMongodb(productId) },
        "comment_right",
        {
          sort: { comment_right: -1 },
        }
      );

      if (maxRightValue) {
        rightValue = maxRightValue + 1;
      } else {
        rightValue = 1;
      }
    }

    //insert
    comment.comment_left = rightValue;
    comment.comment_right = rightValue + 1;

    await Comment.save();
    return comment;
  }

  static async getCommentByParentId({
    productId,
    parentCommentId = null,
    limit = 50,
    offset = 0,
  }) {
    if (parentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent) {
        throw new NotFoundError(
          `Comment parent ${parentComment} does not found`
        );
      }

      const comments = await Comment.find({
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gt: parent.comment_left },
        comment_right: { $lte: parent.comment_right },
      })
        .select({
          comment_left: 1,
          comment_right: 1,
          comment_content: 1,
          comment_parentId: 1,
        })
        .sort({
          comment_left: 1,
        });

      return comments;
    }

    const comments = await Comment.find({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_parentId: parentCommentId,
    })
      .select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        comment_parentId: 1,
      })
      .sort({
        comment_left: 1,
      });

    return comments;
  }
}

module.exports = CommentService;
