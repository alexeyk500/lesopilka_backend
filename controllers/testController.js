const ApiError = require('../error/apiError');
const { User, UserCandidate, SearchRegionAndLocation } = require('../models/userModels');
const { Address, PickUpAddress } = require('../models/addressModels');
const { Basket } = require('../models/basketModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { Reseller } = require('../models/resellerModels');
const { getManufacturerIdForUser } = require('../utils/functions');
const { Product } = require('../models/productModels');
const productController = require('./productController');
const { serverResponseHandler, serverErrorHandler } = require('../utils/serverHandler');
const { generateUserToken } = require('../utils/userFunction');
const { Order, OrderProduct } = require("../models/orderModels");
const { OrderMessage } = require("../models/orderMessageModels");
const { ConfirmedProduct } = require("../models/confirmedProducts");

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

  async deleteTestUserManufacturerPickUpAddress(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return next(ApiError.internal('deleteTestUserManufacturerPickUpAddress - bad request no test user email'));
      }
      const testKey = email.split('-')[0];
      if (testKey !== 'test') {
        return next(ApiError.internal('deleteTestUserManufacturerPickUpAddress - bad request no testKey in user email'));
      }

      const userCandidate = await User.findOne({
        where: { email },
        include: [Manufacturer],
      });
      if (!userCandidate) {
        return next(ApiError.badRequest(`deleteTestUserManufacturerPickUpAddress - user with email ${email} do not exist`));
      }

      const result = await PickUpAddress.destroy({ where: { manufacturerId: userCandidate.manufacturer.id } });
      if (result !== 1) {
        return next(ApiError.badRequest(`deleteTestUserManufacturerPickUpAddress - PickUpAddress destroy error`));
      }
      return res.json({ message: `testUserManufacturerPickUpAddress - deleted` });
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteTestUserManufacturerPickUpAddress - unknownError')
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

  async deleteTestManufacturerOrdersAll(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return next(ApiError.internal('deleteTestManufacturerOrdersAll - bad request no test manufacturer email'));
      }
      const testKey = email.split('-')[0];
      if (testKey !== 'test') {
        return next(ApiError.internal('deleteTestManufacturerOrdersAll - bad request no testKey in user email'));
      }
      const userCandidate = await User.findOne({
        where: { email },
        include: [Manufacturer],
      });
      const manufacturerId = userCandidate.manufacturer.id
      if (!manufacturerId) {
        return next(ApiError.badRequest(`deleteTestManufacturerOrdersAll - manufacturer with email ${email} do not exist`));
      }
      const orders = await Order.findAll({where: {manufacturerId}})
      if (!orders || !orders.length > 0) {
        return res.json({ message: `testManufacturerOrdersAll - deleted` });
      }
      for (let order of orders ) {
        await OrderMessage.destroy({where: {orderId: order.id}})
        await ConfirmedProduct.destroy({where: {orderId: order.id}})
        await OrderProduct.destroy({where: {orderId: order.id}})
        await Order.destroy({where: {id: order.id}})
      }
      return res.json({ message: `testManufacturerOrdersAll - deleted` });
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteTestManufacturerOrdersAll - unknownError')
      );
    }
  }

  async deleteTestUserOrdersAll(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return next(ApiError.internal('deleteTestUserOrdersAll - bad request no test user email'));
      }
      const testKey = email.split('-')[0];
      if (testKey !== 'test') {
        return next(ApiError.internal('deleteTestUserOrdersAll - bad request no testKey in user email'));
      }
      const userCandidate = await User.findOne({
        where: { email },
        include: [Reseller],
      });
      if (!userCandidate) {
        return next(ApiError.badRequest(`deleteTestUserOrdersAll - user with email ${email} do not exist`));
      }
      const orders = await Order.findAll({where: {userId: userCandidate.id}})
      if (!orders || !orders.length > 0) {
        return res.json({ message: `testUserOrdersAll - deleted` });
      }

      for (let order of orders ) {
        await OrderMessage.destroy({where: {orderId: order.id}})
        await Order.destroy({where: {id: order.id}})
      }
      return res.json({ message: `testUserOrdersAll - deleted` });
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteTestUserOrdersAll - unknownError')
      );
    }
  }
}

module.exports = new TestController();
