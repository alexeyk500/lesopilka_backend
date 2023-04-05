const ApiError = require("../error/apiError");
const { getUserResponse } = require("../utils/userFunction");
const { Reseller } = require("../models/resellerModels");
const { Address } = require("../models/addressModels");
const { Manufacturer } = require("../models/manufacturerModels");

class ResellerController {
  async createReseller(req, res, next) {
    try {
      const userId = req.user.id;
      const { family, name, middleName, phone, locationId} = req.body;
      if (!userId || !family || !name || !middleName || !phone || !locationId) {
        return next(ApiError.badRequest('createReseller - request data is not complete'));
      }
      const manufacturerCandidate = await Manufacturer.findOne({ where: { userId } });
      if (manufacturerCandidate) {
        return next(ApiError.badRequest(`User already has been registered as manufacturer`));
      }
      const resellerCandidate = await Reseller.findOne({ where: { userId } });
      if (resellerCandidate) {
        return next(ApiError.badRequest(`User already has been registered as reseller`));
      }
      const resellerCandidateWithPhone = await Reseller.findOne({ where: { phone } });
      if (resellerCandidateWithPhone) {
        return next(ApiError.badRequest(`Reseller with phone=${phone} already exist`));
      }
      const address = await Address.create({ locationId });
      await Reseller.create({ family, name, middleName, phone, userId, addressId: address.id });

      const response = await getUserResponse(userId);
      return res.json(response);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'createReseller - unknownError'));
    }
  }
}

module.exports = new ResellerController();
