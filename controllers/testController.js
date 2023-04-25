const ApiError = require('../error/apiError');
const { User, UserCandidate, SearchRegionAndLocation } = require('../models/userModels');
const { Address } = require('../models/addressModels');
const { Basket } = require('../models/basketModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { Reseller } = require('../models/resellerModels');
const { getManufacturerIdForUser } = require('../utils/functions');
const { Product } = require('../models/productModels');
const productController = require('./productController');
const { serverResponseHandler, serverErrorHandler } = require('../utils/serverHandler');
const { generateUserToken } = require('../utils/userFunction');

class TestController {
  async deleteTestUser(req, res, next) {
    try {
      const { email, isUnconfirmed } = req.body;
      if (!email) {
        return next(ApiError.internal('Bad request no test user email'));
      }
      const testKey = email.split('-')[0];
      if (testKey !== 'test') {
        return next(ApiError.internal('Bad request no testKey in user email'));
      }
      if (isUnconfirmed) {
        const userCandidate = await UserCandidate.findOne({ where: { email } });
        if (!userCandidate) {
          return next(ApiError.badRequest(`userCandidate with email ${email} do not exist`));
        }
        await UserCandidate.destroy({ where: { email } });
        return res.json({ message: `testUserCandidate - deleted` });
      } else {
        const userCandidate = await User.findOne({ where: { email } });
        if (!userCandidate) {
          return next(ApiError.badRequest(`user with email ${email} do not exist`));
        }
        const result = await User.destroy({ where: { email } });
        if (result !== 1) {
          return next(ApiError.badRequest(`deleteTestUser - User destroy error`));
        }
        return res.json({ message: `testUser - deleted` });
      }
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteTestUser - unknownError'));
    }
  }

  async deleteTestUserAddress(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return next(ApiError.internal('deleteTestAddress - bad request no test user email'));
      }
      const testKey = email.split('-')[0];
      if (testKey !== 'test') {
        return next(ApiError.internal('deleteTestAddress - bad request no testKey in user email'));
      }

      const userCandidate = await User.findOne({ where: { email } });
      if (!userCandidate) {
        return next(ApiError.badRequest(`deleteTestAddress - user with email ${email} do not exist`));
      }
      const result = await Address.destroy({ where: { id: userCandidate.addressId } });
      if (result !== 1) {
        return next(ApiError.badRequest(`deleteTestAddress - Address destroy error`));
      }
      return res.json({ message: `testUserAddress - deleted` });
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteTestAddress - unknownError'));
    }
  }

  async deleteTestUserBasket(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return next(ApiError.internal('deleteTestUserBasket - bad request no test user email'));
      }
      const testKey = email.split('-')[0];
      if (testKey !== 'test') {
        return next(ApiError.internal('deleteTestUserBasket - bad request no testKey in user email'));
      }

      const userCandidate = await User.findOne({ where: { email } });
      if (!userCandidate) {
        return next(ApiError.badRequest(`deleteTestUserBasket - user with email ${email} do not exist`));
      }
      const result = await Basket.destroy({ where: { userId: userCandidate.id } });
      if (result !== 1) {
        return next(ApiError.badRequest(`deleteTestUserBasket - Basket destroy error`));
      }
      return res.json({ message: `testUserBasket - deleted` });
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteTestUserBasket - unknownError'));
    }
  }

  async deleteTestUserSearchRegionAndLocation(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return next(ApiError.internal('deleteTestUserBasket - bad request no test user email'));
      }
      const testKey = email.split('-')[0];
      if (testKey !== 'test') {
        return next(ApiError.internal('deleteTestUserSearchRegionAndLocation - bad request no testKey in user email'));
      }

      const userCandidate = await User.findOne({ where: { email } });
      if (!userCandidate) {
        return next(
          ApiError.badRequest(`deleteTestUserSearchRegionAndLocation - user with email ${email} do not exist`)
        );
      }
      const result = await SearchRegionAndLocation.destroy({ where: { userId: userCandidate.id } });
      if (result !== 1) {
        return next(
          ApiError.badRequest(`deleteTestUserSearchRegionAndLocation - SearchRegionAndLocation destroy error`)
        );
      }
      return res.json({ message: `testUserSearchRegionAndLocation - deleted` });
    } catch (e) {
      return next(
        ApiError.badRequest(
          e?.original?.detail ? e.original.detail : 'deleteTestUserSearchRegionAndLocation - unknownError'
        )
      );
    }
  }

  async deleteTestUserManufacturer(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return next(ApiError.internal('deleteTestUserManufacturer - bad request no test user email'));
      }
      const testKey = email.split('-')[0];
      if (testKey !== 'test') {
        return next(ApiError.internal('deleteTestUserManufacturer - bad request no testKey in user email'));
      }

      const userCandidate = await User.findOne({ where: { email } });
      if (!userCandidate) {
        return next(ApiError.badRequest(`deleteTestUserManufacturer - user with email ${email} do not exist`));
      }
      const result = await Manufacturer.destroy({ where: { userId: userCandidate.id } });
      if (result !== 1) {
        return next(ApiError.badRequest(`deleteTestUserManufacturer - Manufacturer destroy error`));
      }
      return res.json({ message: `testUserManufacturer - deleted` });
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteTestUserManufacturer - unknownError')
      );
    }
  }

  async deleteTestUserManufacturerAddress(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return next(ApiError.internal('deleteTestUserManufacturerAddress - bad request no test user email'));
      }
      const testKey = email.split('-')[0];
      if (testKey !== 'test') {
        return next(ApiError.internal('deleteTestUserManufacturerAddress - bad request no testKey in user email'));
      }

      const userCandidate = await User.findOne({
        where: { email },
        include: [Manufacturer],
      });
      if (!userCandidate) {
        return next(ApiError.badRequest(`deleteTestUserManufacturerAddress - user with email ${email} do not exist`));
      }

      const addressId = userCandidate.manufacturer.addressId;
      const result = await Address.destroy({ where: { id: addressId } });
      if (result !== 1) {
        return next(ApiError.badRequest(`deleteTestUserManufacturerAddress - Address destroy error`));
      }
      return res.json({ message: `testUserManufacturerAddress - deleted` });
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteTestUserManufacturer - unknownError')
      );
    }
  }

  async deleteTestUserReseller(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return next(ApiError.internal('deleteTestUserReseller - bad request no test user email'));
      }
      const testKey = email.split('-')[0];
      if (testKey !== 'test') {
        return next(ApiError.internal('deleteTestUserReseller - bad request no testKey in user email'));
      }

      const userCandidate = await User.findOne({ where: { email } });
      if (!userCandidate) {
        return next(ApiError.badRequest(`deleteTestUserReseller - user with email ${email} do not exist`));
      }
      const result = await Reseller.destroy({ where: { userId: userCandidate.id } });
      if (result !== 1) {
        return next(ApiError.badRequest(`deleteTestUserReseller - Reseller destroy error`));
      }
      return res.json({ message: `testUserReseller - deleted` });
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteTestUserReseller - unknownError')
      );
    }
  }

  async deleteTestUserResellerAddress(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return next(ApiError.internal('deleteTestUserResellerAddress - bad request no test user email'));
      }
      const testKey = email.split('-')[0];
      if (testKey !== 'test') {
        return next(ApiError.internal('deleteTestUserResellerAddress - bad request no testKey in user email'));
      }

      const userCandidate = await User.findOne({
        where: { email },
        include: [Reseller],
      });
      if (!userCandidate) {
        return next(ApiError.badRequest(`deleteTestUserResellerAddress - user with email ${email} do not exist`));
      }

      const addressId = userCandidate.reseller.addressId;
      const result = await Address.destroy({ where: { id: addressId } });
      if (result !== 1) {
        return next(ApiError.badRequest(`deleteTestUserResellerAddress - Address destroy error`));
      }
      return res.json({ message: `testUserResellerAddress - deleted` });
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteTestUserResellerAddress - unknownError')
      );
    }
  }

  async deleteTestManufacturerProductsAll(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return next(ApiError.internal('deleteTestManufacturerProductsAll - bad request no test user email'));
      }

      const testKey = email.split('-')[0];
      if (testKey !== 'test') {
        return next(ApiError.internal('deleteTestManufacturerProductsAll - bad request no testKey in user email'));
      }

      const userCandidate = await User.findOne({ where: { email } });
      if (!userCandidate) {
        return next(ApiError.badRequest(`deleteTestManufacturerProductsAll - request denied 1`));
      }

      const manufacturerId = await getManufacturerIdForUser(userCandidate.id);
      if (!manufacturerId) {
        return next(ApiError.badRequest('deleteTestManufacturerProductsAll - request denied 2'));
      }

      const token = generateUserToken(userCandidate);
      const products = await Product.findAll({ where: { manufacturerId } });
      for (let product of products) {
        await productController.deleteProduct(
          {
            user: { id: userCandidate.id },
            headers: { authorization: token },
            body: { productId: product.id },
          },
          serverResponseHandler,
          serverErrorHandler
        );
      }

      return res.json({ message: `deleteTestManufacturerProductsAll - deleted` });
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteTestUserResellerAddress - unknownError')
      );
    }
  }
}

module.exports = new TestController();
