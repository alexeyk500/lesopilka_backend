const ApiError = require('../error/apiError');
const {Basket} = require("../models/basketModels");

class BasketController {

  async putToBasket(req, res, next) {
    try {
      const { userId, productId } = req.body;
      if (!userId || !productId) {
        return next(ApiError.badRequest('putToBasket - not complete data'));
      }
      const basketItem = await Basket.create({ userId, productId });
      return res.json(basketItem);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

}

module.exports = new BasketController();
