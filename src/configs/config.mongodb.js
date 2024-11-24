"use strict";

//level 0
// const config = {
//   app: {
//     port: 3052,
//   },
//   db: {
//     host: "localhost",
//     port: 27017,
//     name: "devShop",
//   },
// };

//level 1
// const dev = {
//   app: {
//     port: 3052,
//   },
//   db: {
//     host: "localhost",
//     port: 27017,
//     name: "devShop",
//   },
// };

// const product = {
//   app: {
//     port: 3052,
//   },
//   db: {
//     host: "localhost",
//     port: 27017,
//     name: "devProduct",
//   },
// };

//level 2
const dev = {
  app: {
    port: process.env.DEV_APP_PORT || 3052,
  },
  db: {
    host: process.env.DEV_DB_HOST || "localhost",
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.DEV_DB_NAME || "shopDev",
  },
  redis: {
    port: process.env.REDIS_PORT || "6379",
    host: process.env.REDIS_HOST || "redis",
  },
  redis_lab: {
    host: process.env.REDIS_LAB_HOST || "redis",
    port: process.env.REDIS_LAB_PORT || "redis",
    password: process.env.REDIS_LAB_PASS || "redis",
    username: process.env.REDIS_LAB_USER || "redis",
  },
};

const product = {
  app: {
    port: process.env.PRO_APP_PORT || 3000,
  },
  db: {
    host: process.env.PRO_DB_HOST || "localhost",
    port: process.env.PRO_DB_PORT || 27017,
    name: process.env.PRO_DB_NAME || "shopProduct",
  },
};

const config = { dev, product };
const env = process.env.NODE_ENV || "dev";

module.exports = config["dev"];
