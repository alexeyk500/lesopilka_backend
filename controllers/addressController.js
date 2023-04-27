const { Region, Location, Address } = require('../models/addressModels');
const ApiError = require('../error/apiError');
const { checkIsUserIsAdmin, checkIsValuePositiveNumber } = require('../utils/checkFunctions');

class AddressController {
  async createRegion(req, res, next) {
    try {
      const userId = req.user.id;
      const { title } = req.body;
      if (!checkIsUserIsAdmin(userId) || !title) {
        return next(ApiError.badRequest('createRegion - request denied'));
      }
      const region = await Region.create({ title });
      return res.json(region);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'createRegion - unknownError'));
    }
  }

  async createLocation(req, res, next) {
    try {
      const userId = req.user.id;
      const { title, regionId } = req.body;
      if (!checkIsUserIsAdmin(userId) || !title || !checkIsValuePositiveNumber(regionId)) {
        return next(ApiError.badRequest('createLocation - request denied'));
      }
      const location = await Location.create({ title, regionId });
      return res.json(location);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'createLocation - unknownError'));
    }
  }

  async createAddress(req, res, next) {
    try {
      const { locationId, street, building, office, postIndex } = req.body;
      if (!locationId || !street || !building) {
        return next(ApiError.badRequest('createAddress - request denied'));
      }
      const address = await Address.create({ locationId, street, building, office, postIndex });
      return res.json(address);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'createAddress - unknownError'));
    }
  }

  async getRegions(req, res, next) {
    try {
      const regions = await Region.findAll({ order: ['title'] });
      return res.json(regions);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'getRegions - unknownError'));
    }
  }

  async getLocations(req, res, next) {
    try {
      const regions = await Location.findAll({ order: ['title'] });
      return res.json(regions);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'getLocations - unknownError'));
    }
  }

  async getLocationsByRegionId(req, res, next) {
    try {
      const { regionId } = req.params;
      const locations = await Location.findAll({ where: { regionId }, order: ['title'] });
      return res.json(locations);
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'getLocationsByRegionId - unknownError')
      );
    }
  }
}

module.exports = new AddressController();
