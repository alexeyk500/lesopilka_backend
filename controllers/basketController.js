const ApiError = require('../error/apiError');
const { Basket, BasketProduct } = require('../models/basketModels');
const {Manufacturer} = require("../models/manufacturerModels");
const {Product, ProductDescription, ProductMaterial, ProductSort} = require("../models/productModels");
const {SubCategory} = require("../models/categoryModels");
const {Picture} = require("../models/pictureModels");
const {Address, Location, Region} = require("../models/addressModels");
const {formatProduct} = require("../utils/functions");

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

  async getBasketProducts(req, res, next) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return next(ApiError.badRequest('getBasketProducts - not complete data, userId'));
      }
      const basket = await Basket.findOne({ where: { userId } });
      if (!basket.id) {
        return next(ApiError.badRequest(`getBasketProducts - could not find Basket for user with id=${userId}`));
      }
      const basketProductsRaw = await BasketProduct.findAll({
        where: {basketId: basket.id},
        attributes: {
          exclude: ['id', 'basketId']
        },
        include: {
          model: Product,
          include: [
            ProductDescription,
            SubCategory,
            ProductMaterial,
            ProductSort,
            Picture,
            {
              model: Manufacturer,
              required: true,
              include: {
                model: Address,
                required: true,
                include: {
                  model: Location,
                  required: true,
                  include: {
                    model: Region,
                  },
                },
              },
            },
          ],
        }
      });
      const basketProducts = basketProductsRaw.map((productRaw) => formatProduct(productRaw.product, req.protocol, req.headers.host));
      return res.json(basketProducts);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new BasketController();
