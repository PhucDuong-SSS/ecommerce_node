"use strict";

const JWT = require("jsonwebtoken");

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    //access token
    const accessToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publicKey, (error, decode) => {
      if (error) {
        console.error(`error verifying access token: `, error);
      } else {
        console.log("decoded access token", decode);
      }
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error(`error verifying access token`, error);
  }
};

module.exports = {
  createTokenPair,
};
