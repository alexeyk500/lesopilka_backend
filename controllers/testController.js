const ApiError = require('../error/apiError');
const { User, UserCandidate, SearchRegionAndLocation } = require('../models/userModels');
const { Address } = require('../models/addressModels');
const { Basket } = require("../models/basketModels");

class TestController {
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
      await Address.destroy({ where: { id: userCandidate.addressId } });
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
      await Basket.destroy({ where: { userId: userCandidate.id } });
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
        return next(ApiError.badRequest(`deleteTestUserSearchRegionAndLocation - user with email ${email} do not exist`));
      }
      await SearchRegionAndLocation.destroy({ where: { userId: userCandidate.id } });
      return res.json({ message: `testUserSearchRegionAndLocation - deleted` });
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteTestUserSearchRegionAndLocation - unknownError'));
    }
  }


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
        await User.destroy({ where: { email } });
        return res.json({ message: `testUser - deleted` });
      }
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteTestUser - unknownError'));
    }
  }
}

module.exports = new TestController();
