const ApiError = require('../error/apiError');
const { Address } = require('../models/addressModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { Reseller } = require('../models/resellerModels');
const { checkIsManufacturerExist } = require('../utils/checkFunctions');
const { setManufacturerWelcomeLicenses } = require('../utils/manufacturerFunctions');

class ManufacturerController {
  async createManufacturer(req, res, next) {
    try {
      const userId = req.user.id;
      const { title, inn, phone, locationId, street, building, office, postIndex, email } = req.body;
      if (!userId || !title || !inn || !phone || !locationId || !street || !building || !postIndex) {
        return next(ApiError.badRequest('createManufacturer - request data is not complete'));
      }

      const resellerCandidate = await Reseller.findOne({ where: { userId } });
      if (resellerCandidate) {
        return next(ApiError.badRequest(`createManufacturer - request denied 2`));
      }

      const isManufacturerExist = await checkIsManufacturerExist({ email, phone, inn });
      if (isManufacturerExist) {
        return next(ApiError.badRequest(isManufacturerExist));
      }

      const address = await Address.create({ locationId, street, building, office, postIndex });
      const manufacturer = await Manufacturer.create({ title, inn, phone, userId, email, addressId: address.id });
      if (!manufacturer) {
        return next(ApiError.badRequest(`createManufacturer - request denied 3`));
      }

      await setManufacturerWelcomeLicenses(manufacturer.id, next);

      return res.json(manufacturer);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'createManufacturer - unknownError'));
    }
  }
}

module.exports = new ManufacturerController();
