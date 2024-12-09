"use strict";

const express = require("express");
const { apiKey, permissions } = require("../auth/checkAuth");
const router = express.Router();

// checking api key
router.use(apiKey);

//checking permissions
router.use(permissions("0000"));

//co trc chay trc
router.use("/v1/api/checkout", require("./checkout"));
router.use("/v1/api/product", require("./product"));
router.use("/v1/api/discount", require("./discount"));
router.use("/v1/api/cart", require("./cart"));
router.use("/v1/api/inventory", require("./inventory"));
router.use("/v1/api/comment", require("./comment"));
router.use("/v1/api", require("./access"));
// router.get("", (req, res, next) => {
//   return res.status(200).json({
//     msg: "welcome to",
//   });
// });

module.exports = router;
