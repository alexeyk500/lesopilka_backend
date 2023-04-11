const { LicenseAction } = require('../models/licenseModels');
const { WELCOME_LICENSES_AMOUNT } = require('./constants');
const ApiError = require('../error/apiError');

const setManufacturerWelcomeLicenses = async (manufacturerId, next) => {
  const newDate = new Date();
  const actionDate = newDate.toISOString();
  const newLicenseAction = await LicenseAction.create({
    actionDate,
    restLicenseAmount: WELCOME_LICENSES_AMOUNT,
    manufacturerId,
  });
  if (!newLicenseAction) {
    return next(ApiError.badRequest('createManufacturer - licenseAction error'));
  }
};

module.exports = {
  setManufacturerWelcomeLicenses,
};
