const { Region, Location, Address } = require('../models/addressModels');
const ApiError = require('../error/apiError');

class AddressController {
  async createRegion(req, res, next) {
    try {
      const { title } = req.body;
      if (!title) {
        return next(ApiError.badRequest('createRegion - not complete data'));
      }
      const region = await Region.create({ title });
      return res.json(region);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async createLocation(req, res, next) {
    try {
      const { title, regionId } = req.body;
      if (!title || !regionId) {
        return next(ApiError.badRequest('createCity - not complete data'));
      }
      const location = await Location.create({ title, regionId });
      return res.json(location);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async createAddress(req, res, next) {
    try {
      const {locationId, street, building, office} = req.body;
      if (!locationId || !street || !building) {
        return next(ApiError.badRequest('createAddress - request data is not complete'));
      }
      const address = await Address.create({ locationId, street, building, office });
      return res.json(address);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getRegions(req, res) {
    const regions = await Region.findAll();
    return res.json(regions);
  }

  async getLocations(req, res) {
    const regions = await Location.findAll();
    return res.json(regions);
  }

  async getLocationsByRegionId(req, res, next) {
    try {
      const { regionId } = req.params;
      const locations = await Location.findAll({ where: { regionId } });
      return res.json(locations);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new AddressController();
