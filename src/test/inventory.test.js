"use strict";

const redisPubSubService = require("../services/redisPubSub.service");

class InventoryServiceTest {
  constructor() {
    redisPubSubService.subscribe("purchase_events", (message) => {
      console.log("Received message: test", message);

      // Parse the message and update the inventory
      const { productId, quantity } = JSON.parse(message);
      InventoryServiceTest.updateInventory(productId, quantity);
    });
  }

  static updateInventory(productId, quantity) {
    console.log(
      `Updating inventory for Product ID: ${productId}, Quantity: ${quantity}`
    );
  }
}

module.exports = new InventoryServiceTest();
