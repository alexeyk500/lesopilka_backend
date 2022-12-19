const ApiError = require('../error/apiError');
const { Basket, BasketProduct } = require('../models/basketModels');

class BasketController {
  async putToBasket(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      if (!userId || !productId) {
        return next(ApiError.badRequest('putToBasket - not complete data'));
      }
      const basket = await Basket.findOne({ where: { userId } });
      if (!basket.id) {
        return next(ApiError.badRequest(`could not find Basket for user with id=${userId}`));
      }
      const candidate = await BasketProduct.findOne({ where: { basketId: basket.id, productId } });
      if (candidate) {
        return next(ApiError.badRequest(`productId=${productId} already in basket for userId=${userId}`));
      }
      const basketProductItem = await BasketProduct.create({ basketId: basket.id, productId });
      return res.json(basketProductItem);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new BasketController();
