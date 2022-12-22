const ApiError = require('../error/apiError');
const { Basket, BasketProduct } = require('../models/basketModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { Product, ProductDescription, ProductMaterial, ProductSort } = require('../models/productModels');
const { SubCategory } = require('../models/categoryModels');
const { Picture } = require('../models/pictureModels');
const { Address, Location, Region } = require('../models/addressModels');
const { formatProduct, updateModelsField } = require('../utils/functions');

const getProductsInBasket = async (basketId, BasketProduct, protocol, host) => {
  const basketProductsRaw = await BasketProduct.findAll({
    where: { basketId },
    attributes: {
      exclude: ['id', 'basketId'],
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
    },
  });
  return basketProductsRaw.map((basketProduct) => {
    const productRaw = formatProduct(basketProduct.product, protocol, host);
    productRaw.amountInBasket = basketProduct.amount;
    return productRaw;
  });
};

class BasketController {
  async toggleProductForBasket(req, res, next) {
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
        await BasketProduct.destroy({ where: { productId } });
      } else {
        await BasketProduct.create({ basketId: basket.id, productId });
      }
      const basketProducts = await getProductsInBasket(basket.id, BasketProduct, req.protocol, req.headers.host);
      return res.json(basketProducts);
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
      const basketProducts = await getProductsInBasket(basket.id, BasketProduct, req.protocol, req.headers.host);
      return res.json(basketProducts);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async setBasketProductsAmount(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId, amount } = req.body;
      if (!userId || !productId) {
        return next(ApiError.badRequest('setBasketProductsAmount - not complete data, userId or productId'));
      }
      const basket = await Basket.findOne({ where: { userId } });
      if (!basket.id) {
        return next(ApiError.badRequest(`setBasketProductsAmount - could not find Basket for user with id=${userId}`));
      }
      const basketProduct = await BasketProduct.findOne({ where: { basketId: basket.id, productId } });
      if (!basketProduct) {
        return next(ApiError.badRequest(`setBasketProductsAmount - could not find basketProducts`));
      }
      await updateModelsField(basketProduct, { amount });
      const basketProducts = await getProductsInBasket(basket.id, BasketProduct, req.protocol, req.headers.host);
      return res.json(basketProducts);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new BasketController();
