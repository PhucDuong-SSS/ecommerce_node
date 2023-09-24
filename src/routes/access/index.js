"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const router = express.Router();

//sign up
router.post("/shop/singup", accessController.signUp);

module.exports = router;
