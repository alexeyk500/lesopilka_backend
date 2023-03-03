const { Manufacturer } = require('../models/manufacturerModels');
const { User } = require('../models/userModels');
const { Product } = require('../models/productModels');
const { OrderProduct } = require('../models/orderModels');

const formatAddress = (address) => {
  if (!address) {
    return undefined;
  }
  return {
    id: address.id,
    postIndex: address.postIndex ? address.postIndex : undefined,
    region: address.location.region
      ? {
          id: address.location.region.id ? address.location.region.id : undefined,
          title: address.location.region.title ? address.location.region.title : undefined,
        }
      : undefined,
    location: address.location
      ? {
          id: address.location.id ? address.location.id : undefined,
          title: address.location.title ? address.location.title : undefined,
        }
      : undefined,
    street: address.street ? address.street : undefined,
    building: address.building ? address.building : undefined,
    office: address.office ? address.office : undefined,
  };
};

const formatManufacturer = (manufacturer) => {
  if (!manufacturer) {
    return undefined;
  }
  return {
    id: manufacturer.id,
    inn: manufacturer.inn ? manufacturer.inn : undefined,
    title: manufacturer.title ? manufacturer.title : undefined,
    email: manufacturer.email ? manufacturer.email : undefined,
    phone: manufacturer.phone ? manufacturer.phone : undefined,
    address: formatAddress(manufacturer.address),
  };
};

const formatProduct = (product, protocol, host) => {
  return {
    id: product.id,
    code: product.code ? product.code : undefined,
    height: product.height ? product.height : undefined,
    width: product.width ? product.width : undefined,
    length: product.length ? product.length : undefined,
    caliber: product.caliber ? product.caliber : undefined,
    price: product.price ? product.price : undefined,
    isSeptic: product.isSeptic,
    isDried: product.isDried,
    editionDate: product.editionDate ? product.editionDate : undefined,
    publicationDate: product.publicationDate ? product.publicationDate : undefined,
    description: product.productDescription
      ? product.productDescription.description
        ? product.productDescription.description
        : undefined
      : undefined,
    category: product.subCategory
      ? product.subCategory.category
        ? { id: product.subCategory.category.id, title: product.subCategory.category.title }
        : undefined
      : undefined,
    subCategory: product.subCategory ? { id: product.subCategory.id, title: product.subCategory.title } : undefined,
    material: product.productMaterial
      ? { id: product.productMaterial.id, title: product.productMaterial.title }
      : undefined,
    sort: product.productSort ? { id: product.productSort.id, title: product.productSort.title } : undefined,
    images: product.pictures
      ? product.pictures.map((picture) => protocol + '://' + host + '/' + picture.fileName)
      : undefined,
    manufacturer: product.manufacturer ? formatManufacturer(product.manufacturer) : undefined,
  };
};

const updateModelsField = async (model, field) => {
  if (field) {
    return await model.update(field);
  }
};

const checkManufacturerForProduct = async (userId, productId) => {
  const userCandidate = await User.findOne({ where: { id: userId }, include: [Manufacturer] });
  if (!userCandidate.manufacturer) {
    return false;
  }
  const product = await Product.findOne({ where: { id: productId } });
  if (!product.manufacturerId) {
    return false;
  }
  return userCandidate.manufacturer.id === product.manufacturerId;
};

const getManufacturerIdForUser = async (userId) => {
  const userCandidate = await User.findOne({ where: { id: userId }, include: [Manufacturer] });
  if (!userCandidate.manufacturer.id) {
    return undefined;
  }
  return userCandidate.manufacturer.id;
};

const checkManufacturerForOrder = async (userId, orderId) => {
  const userCandidate = await User.findOne({ where: { id: userId }, include: [Manufacturer] });
  if (!userCandidate.manufacturer) {
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
  return userCandidate.manufacturer.id === oneOrderProduct.product.manufacturerId;
};

const normalizeDate = (date) => {
  const newDate = new Date(date);
  const newDateStr = newDate.toISOString();
  const onlyDateStr = newDateStr.split('T')[0];
  return new Date(onlyDateStr);
};

const isPositiveNumbersAndZero = (value) => {
  const valueNumber = Number(value);
  return !(isNaN(valueNumber) || valueNumber < 0);
};

const dateDayShift = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

module.exports = {
  formatAddress,
  formatManufacturer,
  formatProduct,
  updateModelsField,
  checkManufacturerForProduct,
  checkManufacturerForOrder,
  getManufacturerIdForUser,
  normalizeData: normalizeDate,
  isPositiveNumbersAndZero,
  dateDayShift,
};
