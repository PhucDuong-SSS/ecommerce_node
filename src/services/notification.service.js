"use strict";
const notificationModel = require("../models/notification.model");

const pushNotificationToSystem = async ({
  type = "SHOP-001",
  receivedId,
  senderId,
  options,
}) => {
  let noti_content;
  if (type === "SHOP-001") {
    noti_content = "@@@ vua moi them mot san pham";
  } else if (type === "PROMOTION-001") {
    noti_content = "@@@ vua moi them mot voucher";
  }

  const newNoti = await notificationModel.create({
    noti_type: type,
    noti_content,
    noti_senderId: senderId,
    noti_receiveId: receivedId,
    noti_options: options,
  });

  return newNoti;
};

const listNotificationByUser = async ({
  userId = 1,
  type = "All",
  isRead = 0,
}) => {
  const match = {
    noti_receiveId: userId,
  };
  if (type !== "All") {
    match["noti_type"] = type;
  }

  return await notificationModel.aggregate([
    {
      $match: match,
    },
    {
      $project: {
        noti_type: 1,
        noti_senderId: 1,
        noti_receiveId: 1,
        noti_content: 1,
        createAt: 1,
        noti_options: 1,
        noti_content: {
          $concat: [
            {
              $substr: ["$noti_options.shop_name", 0, -1],
            },
            "vua them mot san pham",
            {
              $substr: ["$noti_options.product_name", 0, -1],
            },
          ],
        },
      },
    },
  ]);
};

module.exports = {
  pushNotificationToSystem,
  listNotificationByUser,
};
