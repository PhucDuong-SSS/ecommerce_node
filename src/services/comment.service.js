"use strict";

const Comment = require("../models/comment.model");
const { convertToObjectIdMongodb } = require("../utils");
const { findProductById } = require("../models/repositories/product.repo");

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
      const parentComment = await Comment.findOne({ _id: parentId }); // Find parent comment
      if (!parentComment) {
        throw new NotFoundError(`Parent comment with ID ${parentId} not found`);
      }
      rightValue = parentComment.comment_right;

      // Update comments with adjusted left and right values
      await Comment.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_right: { $gte: rightValue },
        },
        { $inc: { comment_right: 2 } }
      );

      await Comment.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_left: { $gt: rightValue },
        },
        { $inc: { comment_left: 2 } }
      );
    } else {
      const maxRightValue = await Comment.findOne(
        { comment_productId: convertToObjectIdMongodb(productId) },
        "comment_right",
        { sort: { comment_right: -1 } }
      );

      if (maxRightValue) {
        rightValue = maxRightValue.comment_right + 1; // Extract `comment_right` explicitly
      } else {
        rightValue = 1;
      }
    }

    comment.comment_left = rightValue;
    comment.comment_right = rightValue + 1;

    // Save the comment instance
    await comment.save(); // Save the instance
    return comment;
  }

  static async getCommentByParentId({
    productId,
    parentCommentId = null,
    limit = 50,
    offset = 0,
  }) {
    if (parentCommentId) {
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

  static async deleteComments({ commentId, productId }) {
    //check product in bd

    const foundProduct = await findProductById(productId);
    if (!foundProduct) {
      throw new NotFoundError(`Product ${productId} not found `);
    }
    // xac dinh gia tri left right cua comment
    const comments = await Comment.findById(commentId);
    if (!comments) {
      throw new NotFoundError(`Comment ${commentId} not found`);
    }

    const leftValue = comments.comment_left;
    const rightValue = comments.comment_right;
    // tinh width
    const width = rightValue - leftValue + 1;
    // xoa comment id con
    await Comment.deleteMany({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_left: { $gte: leftValue, $lte: rightValue },
    });

    // cap nhat gia tri left right
    await Comment.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_right: { $gte: rightValue },
      },
      {
        $inc: {
          comment_right: -width,
        },
      }
    );
    await Comment.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gte: rightValue },
      },
      {
        $inc: {
          comment_left: -width,
        },
      }
    );

    return true;
  }
}

module.exports = CommentService;
