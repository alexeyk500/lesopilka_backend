const { Region, City, Street, Address } = require('../models/addressModels');
const ApiError = require('../error/apiError');

class AddressController {
  async createRegion(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) {
        return next(ApiError.badRequest('createRegion - not complete data'));
      }
      const region = await Region.create({ name });
      return res.json(region);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async createCity(req, res, next) {
    try {
      const { name, regionId } = req.body;
      if (!name || !regionId) {
        return next(ApiError.badRequest('createCity - not complete data'));
      }
      const city = await City.create({ name, regionId });
      return res.json(city);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async createStreet(req, res, next) {
    try {
      const { name, cityId } = req.body;
      if (!name || !cityId) {
        return next(ApiError.badRequest('createStreet - not complete data'));
      }
      const street = await Street.create({ name, cityId });
      return res.json(street);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async createAddress(req, res, next) {
    try {
      const { userId, streetId, home_number, apartment_number } = req.body;
      if (!userId || !streetId || !home_number) {
        return next(ApiError.badRequest('createAddress - not complete data'));
      }
      const address = await Address.create({ userId, streetId, home_number, apartment_number });
      return res.json(address);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getUserAddresses(req, res, next) {
    try {
      const { user_id } = req.params;
      if (!user_id || !Number(user_id)) {
        return next(ApiError.badRequest('getUserAddresses - not complete data'));
      }
      const rawUserAddresses = await Address.findAll({
        where: { userId: user_id },
        include: [{ model: Street, include: [{ model: City, include: [{ model: Region }] }] }],
      });
      const userAddresses = rawUserAddresses.map((address) => {
        return {
          region: address.street.city.region.name,
          city: address.street.city.name,
          street: address.street.name,
          house: address.home_number,
          apartment: address.apartment_number,
        };
      });
      return res.json({ addresses: userAddresses });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new AddressController();
