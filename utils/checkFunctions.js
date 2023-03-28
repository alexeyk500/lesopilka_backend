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
  const oneOrderProduct = await OrderProduct.findOne({
    where: { orderId },
    include: {
      model: Product,
      required: true,
    },
  });
  if (!oneOrderProduct) {
    return false;
  }
  return manufacturerId === oneOrderProduct.product.manufacturerId;
};

const checkIsDateStrIsValidDate = (dateStr) => {
  if (dateStr.length === 0) {
    return false;
  } else {
    return new Date(dateStr).toString() !== 'Invalid Date';
  }
};

module.exports = {
  checkIsValueBoolean,
  checkIsValuePositiveNumber,
  checkIsValueZeroAndPositiveNumber,
  checkIsUserOwnerForOrder,
  checkIsUserManufacturerForOrder,
  checkIsDateStrIsValidDate,
};
