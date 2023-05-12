const ApiError = require('../error/apiError');
const { Address, PickUpAddress } = require('../models/addressModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { Reseller } = require('../models/resellerModels');
const { checkIsManufacturerExist } = require('../utils/checkFunctions');
const { setManufacturerWelcomeLicenses } = require('../utils/manufacturerFunctions');
const { getUserResponse } = require('../utils/userFunction');
const { User } = require('../models/userModels');

class ManufacturerController {
  async createManufacturer(req, res, next) {
    try {
      const userId = req.user.id;
      const { title, inn, phone, locationId, street, building, office, postIndex, email } = req.body;
      if (!userId || !title || !inn || !phone || !locationId || !street || !building || !postIndex || !email) {
        return next(ApiError.badRequest('createManufacturer - request data is not complete'));
      }

      const userCandidate = await User.findOne({ where: { id: userId } });
      if (!userCandidate) {
        return next(ApiError.badRequest(`createManufacturer - request denied 1`));
      }

      const resellerCandidate = await Reseller.findOne({ where: { userId } });
      if (resellerCandidate) {
        return next(ApiError.badRequest(`createManufacturer - request denied 2`));
      }

      const isManufacturerExist = await checkIsManufacturerExist({ email, phone, inn });
      if (isManufacturerExist) {
        return next(ApiError.badRequest(`createManufacturer - request denied 3`));
      }

      const address = await Address.create({ locationId, street, building, office, postIndex });
      if (!address) {
        return next(ApiError.badRequest(`createManufacturer - request denied 4`));
      }

      const manufacturer = await Manufacturer.create({ title, inn, phone, userId, email, addressId: address.id });
      if (!manufacturer) {
        return next(ApiError.badRequest(`createManufacturer - request denied 5`));
      }

      const pickUpAddress =await PickUpAddress.create(
        { locationId, street, building, office, postIndex, manufacturerId: manufacturer.id }
      );
      if (!pickUpAddress) {
        return next(ApiError.badRequest(`createManufacturer - request denied 6`));
      }

      await setManufacturerWelcomeLicenses(manufacturer.id, next);

      const response = await getUserResponse(userId);
      return res.json(response);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'createManufacturer - unknownError'));
    }
  }
}

module.exports = new ManufacturerController();
