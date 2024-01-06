"use strict";

const _ = require("lodash");

const getInfoData = ({ fields = [], object }) => {
  return _.pick(object, fields);
};

const getSelectData = ({ select = [] }) => {
  return Object.entries(select.map((e) => [el, 1]));
};
const getUnSelectData = ({ select = [] }) => {
  return Object.entries(select.map((e) => [el, 0]));
};

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === "object")
      removeUndefinedObject(obj[key]);
    else if (obj[key] == null) delete obj[key];
  });
  return obj;
};

/**
 *
 * const a = {
 * c: {
 *  d:1
 *  }
 * }
 *
 * =>> db.collection.updateOne({
 * `c.d`: 1
 * })
 */
const updateNestedObjectParse = (obj, prefix = "") => {
  const result = {};
  Object.keys(obj).forEach((key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (obj[key] === null || obj[key] === undefined) {
    } else if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      Object.assign(result, updateNestedObjectParse(obj[key], newKey));
    } else {
      result[newKey] = obj[key];
    }
  });
  
  return result;
};

module.exports = {
  getInfoData,
  getSelectData,
  getUnSelectData,
  updateNestedObjectParse,
  removeUndefinedObject,
};
