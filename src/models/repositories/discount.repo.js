"use strict";

const { getUnSelectData, getSelectData } = require("../../utils");
const { discount } = require("../discount.model");
const { Types } = require("mongoose");

const findAllDiscountCodeUnSelect = async ({
  limit,
  page,
  sort = "ctime",
  filter,
  select,
  model,
}) => {
  const skip = ((page ?? 1) - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };

  return await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(select)
    .lean();
};

const findAllDiscountCodeSelect = async ({
  limit,
  page,
  sort = "ctime",
  filter,
  select,
  model,
}) => {
  const skip = ((page ?? 1) - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };

  return await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(select)
    .lean();
};

const checkDiscountExits = async ({ model, filter }) => {
  return model.findOne(filter).lean();
};

module.exports = {
  findAllDiscountCodeUnSelect,
  findAllDiscountCodeSelect,
  checkDiscountExits,
};
