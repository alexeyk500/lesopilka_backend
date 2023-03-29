const { checkIsValuePositiveNumber } = require('../utils/checkFunctions');
const ApiError = require('../error/apiError');
const { Product, ProductDescription, ProductMaterial, ProductSort } = require('../models/productModels');
const { SubCategory } = require('../models/categoryModels');
const { Picture } = require('../models/pictureModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { Address, Location, Region } = require('../models/addressModels');
const { formatProduct } = require('../utils/productFunctions');
const { FavoriteProduct } = require('../models/favoriteModels');

class FavoriteController {
  async createFavoriteProduct(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      if (!userId && !checkIsValuePositiveNumber(productId)) {
        return next(ApiError.badRequest('createFavoriteProduct - request denied 1'));
      }

      const productCandidate = await FavoriteProduct.findOne({ where: { userId, productId } });
      if (productCandidate) {
        return res.json({ message: `product already marked as favorite` });
      }

      const newSelectedProduct = await FavoriteProduct.create({ userId, productId });
      if (!newSelectedProduct) {
        return next(ApiError.badRequest('createFavoriteProduct - db error'));
      }
      return res.json(newSelectedProduct);
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'createFavoriteProduct - unknownError')
      );
    }
  }

  async deleteFavoriteProduct(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      if (!userId && !checkIsValuePositiveNumber(productId)) {
        return next(ApiError.badRequest('deleteFavoriteProduct - request denied 1'));
      }

      const productCandidate = await FavoriteProduct.findOne({ where: { userId, productId } });
      if (!productCandidate) {
        return res.json({ message: `product already unmarked as favorite` });
      }

      const result = await FavoriteProduct.destroy({ where: { userId, productId } });
      if (!result) {
        return next(ApiError.badRequest('deleteFavoriteProduct - db error'));
      }
      return res.json({ message: `${result}` });
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteFavoriteProduct - unknownError')
      );
    }
  }

  async getFavoriteProducts(req, res, next) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return next(ApiError.badRequest('getFavoriteProductsList - request denied 1'));
      }
      const favoriteProductsRaw = await FavoriteProduct.findAll({
        where: { userId },
        attributes: { exclude: ['id', 'userId'] },
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
      const favoriteProducts = [];
      for (let curFavoriteProduct of favoriteProductsRaw) {
        const favoriteProductRaw = await curFavoriteProduct.get('product');
        const favoriteProduct = formatProduct(favoriteProductRaw, req.protocol, req.headers.host);
        favoriteProducts.push(favoriteProduct);
      }
      return res.json(favoriteProducts);
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'getFavoriteProductsList - unknownError')
      );
    }
  }
}

module.exports = new FavoriteController();
