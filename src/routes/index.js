"use strict";

const express = require("express");
const { apiKey, permissions } = require("../auth/checkAuth");
const router = express.Router();

// checking api key
router.use(apiKey);

//checking permissions
router.use(permissions("0000"));

router.use("/v1/api", require("./access"));
router.use("/v1/api/product", require("./product"));
// router.get("", (req, res, next) => {
//   return res.status(200).json({
//     msg: "welcome to",
//   });
// });

module.exports = router;
