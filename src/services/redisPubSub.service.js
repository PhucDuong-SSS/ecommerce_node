"use strict";

const { createClient } = require("redis");

class RedisPubSubService {
  constructor() {
    this.subscriber = createClient(); // Create Redis client for subscription
    this.publisher = createClient(); // Create Redis client for publishing

    // Connect the clients
    this.subscriber.connect().catch((err) => {
      console.error("Error connecting Redis subscriber:", err);
    });
    this.publisher.connect().catch((err) => {
      console.error("Error connecting Redis publisher:", err);
    });
  }

  async publish(channel, message) {
    try {
      const result = await this.publisher.publish(channel, message); // Publish the message
      console.log(`Message published to channel "${channel}": ${message}`);
      return result; // Returns the number of clients that received the message
    } catch (err) {
      console.error("Error publishing message:", err);
      throw err;
    }
  }

  async subscribe(channel, callback) {
    try {
      await this.subscriber.subscribe(channel, (message) => {
        callback(message); // Call the provided callback function
      });
      console.log(`Subscribed to channel "${channel}"`);
    } catch (err) {
      console.error("Error subscribing to channel:", err);
      throw err;
    }
  }
}

module.exports = new RedisPubSubService();
