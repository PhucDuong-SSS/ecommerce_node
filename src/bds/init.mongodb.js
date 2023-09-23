"use strict";

const mongoose = require("mongoose");

const connectString = `mongodb://localhost:27017/shopDev`;

class DataBase {
  constructor() {
    this.connect();
  }

  // connect
  connect(type = "mongodb") {
    //dev
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(connectString, {
        maxPoolSize: 50,
      })
      .then((_) => console.log("Connect success pro!"))
      .catch((err) => {
        console.log("errors connect");
      });
  }

  static getInstance() {
    if (!DataBase.instance) {
      DataBase.instance = new DataBase();
    }

    return DataBase.instance;
  }
}

const instanceMongodb = new DataBase();

module.exports = instanceMongodb;
