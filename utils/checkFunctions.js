const { OrderProduct } = require('../models/orderModels');
const { Product } = require('../models/productModels');
const { getManufacturerIdForUser } = require('./functions');
const { User } = require('../models/userModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { ResellerManufacturerCandidate } = require('../models/resellerModels');
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

const checkIsUserExist = async ({ email, phone }) => {
  const userCandidateEmail = await User.findOne({ where: { email } });
  if (userCandidateEmail) {
    return `User with email ${email} already exist`;
  }
  if (phone) {
    const userCandidatePhone = await User.findOne({ where: { phone } });
    if (userCandidatePhone) {
      return `User with phone ${phone} already exist`;
    }
  }
};

const checkIsManufacturerExist = async ({ email, phone, inn }) => {
  const manufacturerCandidateEmail = await Manufacturer.findOne({ where: { email } });
  if (manufacturerCandidateEmail) {
    return `Manufacturer with email=${email} already exist`;
  }
  const manufacturerCandidatePhone = await Manufacturer.findOne({ where: { phone } });
  if (manufacturerCandidatePhone) {
    return `Manufacturer with phone=${phone} already exist`;
  }
  const manufacturerCandidateInn = await Manufacturer.findOne({ where: { inn } });
  if (manufacturerCandidateInn) {
    return `Manufacturer with inn=${inn} already exist`;
  }
};

const checkIsResellerManufacturerCandidateExist = async ({ email, phone, inn }) => {
  const resellerManufacturerCandidateEmail = await ResellerManufacturerCandidate.findOne({ where: { email } });
  if (resellerManufacturerCandidateEmail) {
    return `resellerManufacturerCandidate with email=${email} already exist`;
  }
  const resellerManufacturerCandidatePhone = await ResellerManufacturerCandidate.findOne({ where: { phone } });
  if (resellerManufacturerCandidatePhone) {
    return `resellerManufacturerCandidate with phone=${phone} already exist`;
  }
  const resellerManufacturerCandidateInn = await ResellerManufacturerCandidate.findOne({ where: { inn } });
  if (resellerManufacturerCandidateInn) {
    return `resellerManufacturerCandidate with inn=${inn} already exist`;
  }
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
  checkIsUserExist,
  checkIsManufacturerExist,
  checkIsResellerManufacturerCandidateExist,
};
