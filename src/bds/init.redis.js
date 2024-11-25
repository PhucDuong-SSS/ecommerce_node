"use trick";
const {
  redis_lab: { host, port, username, password },
} = require("../configs/config.mongodb");
// const redis = require("redis");

// // create new client
// const client = new redis.Client({
//   host: "localhost",
//   port: 3000,
//   password: "password",
//   username: "username",
// });

// client.on("error", (err) => {
//   console.error(`error: ${err}`);
// });

// module.exports = client;

//cach 2

const redis = require("redis");
const { RedisErrorResponse } = require("../core/error.response");
let client = {};
let connectStatus = {
  READY: "ready",
  END: "end",
  RECONNECTING: "reconnecting",
  ERROR: "error",
};

const REDIS_CONNECT_TIMEOUT = 10000;
const REDIS_CONNECT_MESSAGE = {
  code: -99,
  message: {
    vn: "qua thoi gian",
    en: "timeout",
  },
};

const handleTimeoutError = (err) => {
  return (connectTimeout = setTimeout(() => {
    throw new RedisErrorResponse({
      message: REDIS_CONNECT_MESSAGE.message.vn,
      statusCodes: REDIS_CONNECT_MESSAGE.code,
    });
  }, REDIS_CONNECT_TIMEOUT));
};

const handleEventConnect = ({ connectionRedis }) => {
  connectionRedis.on("ready", () => {
    console.log(`connectionRedis: connected`);
    clearTimeout(connectTimeout);
  });

  connectionRedis.on(connectStatus.READY, () => {
    console.log(`connectionRedis: connected`);
    clearTimeout(connectTimeout);
  });
  connectionRedis.on(connectStatus.END, () => {
    console.log(`connectionRedis: end`);
    handleTimeoutError();
  });
  connectionRedis.on(connectStatus.RECONNECTING, () => {
    console.log(`connectionRedis: reconnect`);
    clearTimeout(connectTimeout);
  });
  connectionRedis.on(connectStatus.ERROR, (err) => {
    console.log(`connectionRedis: error, ${err}`);
    handleTimeoutError();
  });
};

const initRedis = () => {
  const instance = new redis.createClient({
    socket: {
      host,
      port,
    },
    username,
    password,
  });

  handleEventConnect({ connectionRedis: instance });

  // Start connection
  connectTimeout = setTimeout(handleTimeoutError, 5000); // 5 seconds timeout
  instance
    .connect()
    .then(() => {
      console.log("Redis client successfully connected.");
    })
    .catch((err) => {
      console.error("Failed to connect to Redis:", err);
    });

  client.instanceConnect = instance;
};

const getRedis = () => client;
const closeRedis = () => {
  if (client.instanceConnect) {
    client.instanceConnect.quit((err, res) => {
      if (err) {
        console.log(`Error while closing Redis connection: ${err}`);
      } else {
        console.log("Redis connection closed successfully.");
      }
      client.instanceConnect = null;
    });
  } else {
    console.log("No active Redis connection to close.");
  }
};

module.exports = {
  initRedis,
  getRedis,
  closeRedis,
};
