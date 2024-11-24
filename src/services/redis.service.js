"use strict";

const {
  reservationInventory,
} = require("../models/repositories/inventory.repo");
const { getRedis } = require("../bds/init.redis");
const { instanceConnect: redisClient } = getRedis();

const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2023_${productId}`;
  const retryTimes = 10;
  const expiredTimes = 3000; // 3s

  for (let i = 0; i < retryTimes; i++) {
    try {
      // Attempt to set the key if it does not exist
      const result = await redisClient.setNX(key, expiredTimes);
      console.log(`Result: ${result}`);

      if (result === 1) {
        // Perform operations with inventory
        const isReservation = await reservationInventory({
          productId,
          quantity,
          cartId,
        });

        if (isReservation.modifiedCount) {
          // Set expiration for the lock key
          await redisClient.pExpire(key, expiredTimes);
        }

        return key; // Lock acquired, return the key
      } else {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error(`Error acquiring lock: ${error}`);
    }
  }

  return null; // Lock not acquired after retrying
};

const releaseLock = async (lock) => {
  try {
    // Delete the lock key
    const result = await redisClient.del(lock);
    return result;
  } catch (error) {
    console.error(`Error releasing lock: ${error}`);
    throw error;
  }
};

module.exports = {
  releaseLock,
  acquireLock,
};
