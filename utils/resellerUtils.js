const { ResellerManufacturer } = require('../models/resellerModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { Address, Location, Region } = require('../models/addressModels');
const { LicenseAction } = require('../models/licenseModels');
const { getProductCardsAmountsByManufacturerId } = require('../jobs/licenseJob');
const { formatManufacturerAddress } = require('./priceListFunctions');

const getResellerManufacturersList = async (resellerId) =>
  await ResellerManufacturer.findAll({
    where: { resellerId },
    include: {
      model: Manufacturer,
      attributes: { exclude: ['userId', 'addressId'] },
      include: {
        model: Address,
        attributes: { exclude: ['locationId'] },
        include: {
          model: Location,
          attributes: { exclude: ['regionId'] },
          include: {
            model: Region,
          },
        },
      },
    },
  });

const getManufacturerRestLicenseAmount = async (manufacturerId) => {
  const lastLicenseAction = await LicenseAction.findOne({
    where: { manufacturerId },
    order: [['actionDate', 'DESC']],
  });
  const restLicenseAmount = lastLicenseAction.restLicenseAmount;
  return restLicenseAmount !== null ? restLicenseAmount : 0;
};

const getResellerManufacturersLicensesInfoList = async (manufacturersList) => {
  const resultList = [];
  for (let manufacturer of manufacturersList) {
    let newManufacturer = {};
    const restLicenseAmount = await getManufacturerRestLicenseAmount(manufacturer.id);
    const { activeProductCardAmount } = await getProductCardsAmountsByManufacturerId(manufacturer.id);
    newManufacturer.id = manufacturer.manufacturer.id;
    newManufacturer.inn = manufacturer.manufacturer.inn;
    newManufacturer.title = manufacturer.manufacturer.title;
    newManufacturer.phone = manufacturer.manufacturer.phone;
    newManufacturer.email = manufacturer.manufacturer.email;
    newManufacturer.address = formatManufacturerAddress(manufacturer.manufacturer);
    newManufacturer.approved = manufacturer.manufacturer.approved;
    newManufacturer.activeCards = activeProductCardAmount;
    newManufacturer.restLicenses = restLicenseAmount;
    resultList.push(newManufacturer);
  }
  return resultList;
};

module.exports = {
  getResellerManufacturersList,
  getResellerManufacturersLicensesInfoList,
};
