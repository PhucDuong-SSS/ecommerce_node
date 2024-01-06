"use strict";

const { Types } = require("mongoose");
const {
  product,
  electronic,
  furniture,
  clothing,
} = require("../product.model");
const { productStatus } = require("../../constants/product");
const { getUnSelectData } = require("../../utils");

const findAllDraftForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

const publishOrUnpublishProductByShop = async ({
  product_shop,
  product_id,
  type,
}) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundShop) return null;

  console.log(type);

  foundShop.is_Draft = type === productStatus.publish ? false : true;
  foundShop.is_Publish = type === productStatus.publish ? true : false;

  const { modifiedCount } = await foundShop.save(foundShop); // update = 1

  return modifiedCount;
};

const searchProducts = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);

  return await product
    .findOne(
      {
        is_Publish: true,
        $text: { $search: regexSearch },
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();
};

const findAllProducts = async ({
  limit,
  sort,
  page,
  filter = { is_Publish: true },
  select,
}) => {
  const skip = ((page ?? 1) - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };

  return await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(select)
    .lean();
};

const findProduct = async ({ productId, unSelect }) => {
  return await product
    .findOne({ is_Publish: true, _id: productId })
    .select(getUnSelectData(unSelect));
};

const updateProductById = async ({
  productId,
  payload,
  model,
  isNew = true,
}) => {
  return await model.findByIdAndUpdate(productId, payload, {
    new: isNew,
  });
};

module.exports = {
  findAllDraftForShop,
  findAllPublishForShop,
  publishOrUnpublishProductByShop,
  searchProducts,
  findAllProducts,
  findProduct,
  updateProductById,
};
