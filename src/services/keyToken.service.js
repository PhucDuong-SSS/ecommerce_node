"use strict";

const keytokenModel = require("../models/keytoken.model");
const {
  Types: { ObjectId },
} = require("mongoose");
class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // level 0
      //   const publicKeyString = publicKey.toString();
      // const tokens = await keytokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey,
      // });

      // return tokens ? tokens.publicKey : null;

      //level xx

      const filter = { user: userId },
        update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken },
        options = { upsert: true, new: true };
      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static findByUserId = async (userId) => {
    return await keytokenModel.findOne({ user: new ObjectId(userId) }).lean();
  };

  static removeTokenById = async (id) => {
    return await keytokenModel.deleteOne({
      _id: new ObjectId(id),
    });
  };
}

module.exports = KeyTokenService;
