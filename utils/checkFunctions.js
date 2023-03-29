const { OrderProduct } = require('../models/orderModels');
const { Product } = require('../models/productModels');
const { getManufacturerIdForUser } = require('./functions');
const checkIsValueBoolean = (value) => {
  return typeof value == 'boolean';
};

const checkIsValuePositiveNumber = (value) => {
  const valueNumber = Number(value);
  return !(isNaN(valueNumber) || valueNumber <= 0);
};

const checkIsValueZeroAndPositiveNumber = (value) => {
  const valueNumber = Number(value);
  return !(isNaN(valueNumber) || valueNumber < 0);
};

const checkIsUserOwnerForOrder = (userId, order) => {
  return userId === order.userId;
};

const checkIsUserManufacturerForOrder = async (userId, orderId) => {
  const manufacturerId = await getManufacturerIdForUser(userId);
  if (!manufacturerId) {
    return false;
  }
  const orderProduct = await OrderProduct.findOne({
    where: { orderId },
    include: {
      model: Product,
      required: true,
    },
  });
  if (!orderProduct) {
    return false;
  }
  const product = await orderProduct.get('product');
  return manufacturerId === product.manufacturerId;
};

const checkIsUserManufacturerForProduct = async (userId, productId) => {
  const manufacturerId = await getManufacturerIdForUser(userId);
  if (!manufacturerId) {
    return false;
  }
  const product = await Product.findOne({
    where: { id: productId },
  });
  if (!product) {
    return false;
  }
  return manufacturerId === product.manufacturerId;
};

const checkIsDateStrIsValidDate = (dateStr) => {
  if (dateStr.length === 0) {
    return false;
  } else {
    return new Date(dateStr).toString() !== 'Invalid Date';
  }
};

const checkIsValueExist = (value) => {
  return !(value === null || value === undefined);
};

module.exports = {
  checkIsValueBoolean,
  checkIsValuePositiveNumber,
  checkIsValueZeroAndPositiveNumber,
  checkIsUserOwnerForOrder,
  checkIsUserManufacturerForOrder,
  checkIsUserManufacturerForProduct,
  checkIsDateStrIsValidDate,
  checkIsValueExist,
};
