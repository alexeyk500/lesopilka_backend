const { ResellerManufacturer } = require('../models/resellerModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { Address, Location, Region } = require('../models/addressModels');
const { LicenseAction } = require('../models/licenseModels');
const { getProductCardsAmountsByManufacturerId } = require('../jobs/licenseJob');
const { formatManufacturerAddress } = require('./priceListFunctions');
const { normalizeData } = require('./functions');

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

const getGroupedResellersManufacturersLicenseActions = (licenseActionsRaw) => {
  const licenseActions = [];

  for (let curAction of licenseActionsRaw) {
    console.log('actionDate =', curAction.actionDate.toISOString().split('T')[0]);
    const result = licenseActions.find(
      (curFindLA) =>
        curFindLA.actionDate.toISOString().split('T')[0] === curAction.actionDate.toISOString().split('T')[0]
    );
    if (result) {
      result.redeemLicenseAmount += curAction.redeemLicenseAmount;
      result.activeProductCardAmount += curAction.activeProductCardAmount;
      result.draftProductCardAmount += curAction.draftProductCardAmount;
    } else {
      licenseActions.push({
        id: licenseActions.length + 1,
        actionDate: normalizeData(curAction.actionDate),
        restLicenseAmount: null,
        redeemLicenseAmount: curAction.redeemLicenseAmount,
        purchaseLicenseAmount: null,
        activeProductCardAmount: curAction.activeProductCardAmount,
        draftProductCardAmount: curAction.draftProductCardAmount,
        receiptTransactionId: null,
      });
    }
  }

  return licenseActions;
};

module.exports = {
  getResellerManufacturersList,
  getResellerManufacturersLicensesInfoList,
  getGroupedResellersManufacturersLicenseActions,
};
