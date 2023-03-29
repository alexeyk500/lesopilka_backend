const { Manufacturer } = require('../models/manufacturerModels');
const { User } = require('../models/userModels');

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

const updateModelsField = async (model, field) => {
  if (field) {
    return await model.update(field);
  }
};

const getManufacturerIdForUser = async (userId) => {
  const userCandidate = await User.findOne({ where: { id: userId }, include: [Manufacturer] });
  if (!userCandidate.manufacturer.id) {
    return undefined;
  }
  return userCandidate.manufacturer.id;
};

const normalizeData = (date) => {
  const newDate = new Date(date);
  const newDateStr = newDate.toISOString();
  const onlyDateStr = newDateStr.split('T')[0];
  return new Date(onlyDateStr);
};

const dateDayShift = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

module.exports = {
  formatAddress,
  formatManufacturer,
  updateModelsField,
  getManufacturerIdForUser,
  normalizeData,
  dateDayShift,
};
