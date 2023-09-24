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
