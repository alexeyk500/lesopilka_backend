const { ResellerManufacturer } = require('../models/resellerModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { Address, Location, Region } = require('../models/addressModels');
const { LicenseAction } = require('../models/licenseModels');
const { getProductCardsAmountsByManufacturerId } = require('../jobs/licenseJob');

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
    newManufacturer.manufacturer = manufacturer.manufacturer;
    newManufacturer.restLicenseAmount = restLicenseAmount;
    newManufacturer.activeProductCardAmount = activeProductCardAmount;
    resultList.push(newManufacturer);
  }
  return resultList;
};

module.exports = {
  getResellerManufacturersList,
  getResellerManufacturersLicensesInfoList,
};
