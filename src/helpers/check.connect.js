"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECONDS = 500000;
const MAX_CONNECTIONS_PER_CORE = 5;

// count connections
const countConnect = () => {
  const connectionNumbers = mongoose.connections.length;
  console.log(`number connections: ${connectionNumbers}`);
};

// check overloading
const checkOverloading = () => {
  setInterval(() => {
    const numberOfConnections = mongoose.connections.length;
    const numberOfCore = os.cpus().length;
    const maxConnections = numberOfCore * MAX_CONNECTIONS_PER_CORE;
    const memoryUsage = process.memoryUsage().rss;

    console.log(`memoryUsage ${memoryUsage / 1024 / 1024} MB`);

    if (numberOfConnections > maxConnections) {
      console.log(
        `overloading with numberOfConnections ${numberOfConnect} and maxConnections ${maxConnections}`
      );
    }
  }, _SECONDS);
};
module.exports = {
  countConnect,
  checkOverloading,
};
