"use strict";

const { Types } = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;
const { BadRequestError } = require("../core/error.response");
const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const {
  findAllDraftForShop,
  publishOrUnpublishProductByShop,
  findAllPublishForShop,
  searchProducts,
  findAllProducts,
  findProduct,
  updateProductById,
} = require("../models/repositories/product.repo");
const { productStatus } = require("../constants/product");
const { updateNestedObjectParse, removeUndefinedObject } = require("../utils");

// define a factory class to create a product

class ProductFactory {
  static productRegistry = {};

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  /**
   * type: clothing
   * payload
   */
  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new BadRequestError(`Invalid Product type ${type}`);
    } else {
      return new productClass(payload).createProduct();
    }
  }

  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new BadRequestError(`Invalid Product type ${type}`);
    } else {
      return new productClass(payload).updateProduct(productId);
    }
  }

  static async publishProductByShop({
    product_shop,
    product_id,
    type = productStatus.publish,
  }) {
    const shop = await publishOrUnpublishProductByShop({
      product_shop,
      product_id,
      type,
    });
  }

  static async unPublishProductByShop({
    product_shop,
    product_id,
    type = productStatus.unPublish,
  }) {
    const shop = await publishOrUnpublishProductByShop({
      product_shop,
      product_id,
      type,
    });
  }

  static async findAllDraftForShop(product_shop, limit = 50, skip = 0) {
    const query = {
      product_shop: new ObjectId(product_shop),
      is_Draft: true,
    };
    findAllPublishForShop;
    return await findAllDraftForShop({ query, limit, skip });
  }

  static async findAllPublishForShop(product_shop, limit = 50, skip = 0) {
    const query = {
      product_shop: new ObjectId(product_shop),
      is_Publish: true,
    };

    return await findAllPublishForShop({ query, limit, skip });
  }

  static async searchProducts({ keySearch }) {
    return await searchProducts({ keySearch });
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { is_Publish: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ["product_name", "product_thumb", "product_price"],
    });
  }

  static async findProduct({ productId, unSelect = ["__v"] }) {
    return await findProduct({
      productId,
      unSelect,
    });
  }
}

// define base product class

class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    (this.product_name = product_name),
      (this.product_thumb = product_thumb),
      (this.product_description = product_description),
      (this.product_price = product_price),
      (this.product_quantity = product_quantity),
      (this.product_type = product_type),
      (this.product_shop = product_shop),
      (this.product_attributes = product_attributes);
  }

  // create new product
  async createProduct(productId) {
    return await product.create({ ...this, _id: productId });
  }

  async updateProduct(productId, payload) {
    return await updateProductById({ productId, payload, model: product });
  }
}

// define sub-class for difference product type clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) {
      throw new BadRequestError("create new clothing error");
    }

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) {
      throw new BadRequestError("create new product error");
    }

    return newProduct;
  }

  async updateProduct(productId) {
    const objectParams = removeUndefinedObject(this);

    if (objectParams.product_attributes) {
      await updateProductById({
        productId,
        payload: updateNestedObjectParse(objectParams.product_attributes),
        model: clothing,
      });
    }

    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParse(objectParams)
    );

    return updateProduct;
  }
}

// define sub-class for difference product type electronics

class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic) {
      throw new BadRequestError("create new electronic error");
    }

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) {
      throw new BadRequestError("create new product error");
    }
    return newProduct;
  }

  async updateProduct(productId) {
    const objectParams = removeUndefinedObject(this);

    if (objectParams.product_attributes) {
      await updateProductById({
        productId,
        payload: updateNestedObjectParse(objectParams.product_attributes),
        model: clothing,
      });
    }

    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParse(objectParams)
    );

    return updateProduct;
  }
}

class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture) {
      throw new BadRequestError("create new furniture error");
    }

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) {
      throw new BadRequestError("create new product error");
    }
    return newProduct;
  }

  async updateProduct(productId) {
    const objectParams = removeUndefinedObject(this);

    if (objectParams.product_attributes) {
      await updateProductById({
        productId,
        payload: updateNestedObjectParse(objectParams.product_attributes),
        model: clothing,
      });
    }

    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParse(objectParams)
    );

    return updateProduct;
  }
}

ProductFactory.registerProductType("Electronic", Electronic);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
