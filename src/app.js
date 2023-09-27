require("dotenv").config();
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
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// init database
require("./bds/init.mongodb");
const { countConnect, checkOverloading } = require("./helpers/check.connect");
countConnect();
checkOverloading();

// init routes
app.use("/", require("./routes/index"));

// handle errors
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;

  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;

  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    error: error.stack,
    message: error.message || "Internal server error",
  });
});
module.exports = app;
