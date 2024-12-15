"use strict";

const { listNotificationByUser } = require("../services/notification.service");
const { SuccessResponse } = require("../core/success.response");

class NotificationController {
  listNotificationByUser = async (req, res, next) => {
    new SuccessResponse({
      message: "get listNotificationByUser",
      metadata: await listNotificationByUser(req.query),
    }).send(res);
  };
}

module.exports = new NotificationController();
