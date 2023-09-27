"use strict";

const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const shopModel = require("../models/shop.model");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const roleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    // try {
    // step 1: check email existence?
    const holderShop = await shopModel.findOne({ email }).lean();

    if (holderShop) {
      throw new BadRequestError("Error: Shop is exist");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [roleShop.SHOP],
    });

    if (newShop) {
      // create privateKey and publicKey

      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });

      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("Error:keyStore key error ");
      }

      // create token pair
      const tokens = await createTokenPair(
        {
          userId: newShop._id,
          email,
        },
        publicKey,
        privateKey
      );

      console.log("created token successfully", tokens);

      return {
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }

    return {
      code: 200,
      metadata: null,
    };
    // } catch (error) {
    //   return {
    //     code: "xxx",
    //     message: error.message,
    //     status: "error",
    //   };
    // }
  };

  /**
   *
   * 1. check email address
   * 2. check password
   * 3. create AT adm RT and save
   * 4. generate tokens
   * 5. get data and return token
   */

  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });

    if (!foundShop) {
      throw new BadRequestError("Shop did not registered");
    }

    const match = bcrypt.compare(password, foundShop.password);

    if (!match) {
      throw new AuthFailureError("authentication error");
    }

    //3
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      {
        userId,
        email,
      },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      userId,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeTokenById(keyStore._id);

    return delKey;
  };

  static handlerRefreshToken = async (refreshToken) => {
    // check token used
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );

    if (foundToken) {
      // decode xem la thang nao
      const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey);
      // xoa tat ca token trong keystore
      await KeyTokenService.deleteKeyById(userId);

      throw new ForbiddenError(
        "Something went wrong, please try re login again"
      );
    }
    //No
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    console.log(refreshToken, holderToken);
    if (!holderToken) {
      throw new AuthFailureError("shop not registered1");
    }

    // verify token
    const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey);

    //check userId
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError("shop not registered2");
    }

    // create 1 cap moi
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    //update token

    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };
}

module.exports = AccessService;
