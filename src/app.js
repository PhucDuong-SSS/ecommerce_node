const express = require("express");
const { compile } = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const app = express();

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression()); 

// init database

// init routes
app.get("/", (req, res, next) => {
  const str = "heloe";
  return res.status(200).json({
    msg: "welcome to",
    mass: str.repeat(10000),
  });
});
// handle errors

module.exports = app;
