"use strict";

const redis = require("redis");
const { promisify } = require("util");
const {
  reservationInventory,
} = require("../models/repositories/inventory.repo");
const redisClient = redis.createClient();

const pexpire = promisify(redisClient.pexpire).bind(redisClient);
const setnxAsync = promisify(redisClient.pexpire).bind(redisClient);

const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2023_${productId}`;
  const retryTimes = 10;
  const expriedTimes = 3000; // 3s

  for (let i = 0; i < retryTimes; i++) {
    // tao key thang nao nam giu  vao thanh toan
    const result = await setnxAsync(key, expriedTimes);
    console.log(`result ${result}`);

    if (result === 1) {
      // thao tac voi inventory
      const isReservation = await reservationInventory({
        productId,
        quantity,
        cartId,
      });

      if (isReservation.modifiedCount) {
        await pexpire(key, expriedTimes);
      }

      return key;
    } else {
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    }
  }
};

const releaseLock = async (lock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient);

  return await delAsyncKey(lock);
};

// giu lai khong  cho nguoi sau thanh toan
module.exports = {
  releaseLock,
  acquireLock,
};
