const { Region, City, Address, Location } = require('../models/addressModels');
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

  async createCity(req, res, next) {
    try {
      const { title, regionId } = req.body;
      if (!title || !regionId) {
        return next(ApiError.badRequest('createCity - not complete data'));
      }
      const city = await City.create({ title, regionId });
      return res.json(city);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async createAddress(req, res, next) {
    try {
      const { apartment, house, street, cityId, userId } = req.body;
      if (!house || !street || !cityId) {
        return next(ApiError.badRequest('createAddress - not complete data'));
      }
      const address = await Address.create({ apartment, house, street, cityId, userId });
      return res.json(address);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getUserAddresses(req, res, next) {
    try {
      const { userId } = req.params;
      if (!userId || !Number(userId)) {
        return next(ApiError.badRequest('getUserAddresses - not complete data'));
      }
      const userAddresses = await Address.findAll({
        where: { userId },
        include: [{ model: City, include: [{ model: Region }] }],
      });
      return res.json({ userId, userAddresses });
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
