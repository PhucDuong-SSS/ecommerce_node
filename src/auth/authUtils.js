"use strict";

const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { NotFoundError, AuthFailureError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    //access token
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
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

const authentication = asyncHandler(async (req, res, next) => {
  /**
   * 1. check userId
   * 2. get access token
   * 3. verify token
   * 4. check user in db
   * 5. check key store with this userId
   * 6 . Ok return next
   */

  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError("Invalid request");
  }
  //2.

  const keyStore = await findByUserId(userId);

  if (!keyStore) {
    throw new NotFoundError("Not found key store");
  }

  //3.
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) {
    throw new AuthFailureError("Invalid request");
  }

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);

    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid user");
    }
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createTokenPair,
  authentication,
};
