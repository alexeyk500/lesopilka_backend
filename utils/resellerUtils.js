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

const getResellerManufacturersLicensesInfoList = async (resellerManufacturersList) => {
  const resultList = [];
  for (let resellerManufacturer of resellerManufacturersList) {
    let newManufacturer = {};
    const restLicenseAmount = await getManufacturerRestLicenseAmount(resellerManufacturer.manufacturer.id);
    const { activeProductCardAmount } = await getProductCardsAmountsByManufacturerId(
      resellerManufacturer.manufacturer.id
    );
    newManufacturer.id = resellerManufacturer.manufacturer.id;
    newManufacturer.inn = resellerManufacturer.manufacturer.inn;
    newManufacturer.title = resellerManufacturer.manufacturer.title;
    newManufacturer.phone = resellerManufacturer.manufacturer.phone;
    newManufacturer.email = resellerManufacturer.manufacturer.email;
    newManufacturer.address = formatManufacturerAddress(resellerManufacturer.manufacturer);
    newManufacturer.approved = resellerManufacturer.manufacturer.approved;
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
