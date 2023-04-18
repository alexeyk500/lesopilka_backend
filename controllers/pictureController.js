const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const ApiError = require('../error/apiError');
const { Picture } = require('../models/pictureModels');
const {
  checkIsUserManufacturerForProduct,
  checkIsValuePositiveNumber,
  checkIsUserIsAdmin,
} = require('../utils/checkFunctions');

class PictureController {
  async uploadProductPicture(req, res, next) {
    try {
      const { img } = req.files;
      const userId = req.user.id;
      const { categoryId, productId } = req.body;
      if (!img && !userId && !checkIsValuePositiveNumber(productId)) {
        return next(ApiError.badRequest('uploadProductPicture - request denied 1'));
      }
      const manufacturerCandidate = await checkIsUserManufacturerForProduct({ userId, productId });
      if (!manufacturerCandidate) {
        return next(ApiError.badRequest('uploadProductPicture - request denied 2'));
      }

      const productPictures = await Picture.findAll({ where: { productId } });

      if (productPictures.length >= 3) {
        return next(ApiError.badRequest('uploadProductPicture - request denied 3'));
      }
      const maxProductPictureOrder =
        productPictures.length === 0 ? 0 : Math.max(...productPictures.map((picture) => picture.order));

      const fileName = uuid.v4() + '.jpg';
      await img.mv(path.resolve(__dirname, '..', 'static', fileName));

      const picture = await Picture.create({
        fileName,
        categoryId,
        productId,
        order: maxProductPictureOrder + 1,
      });
      return res.json({ picture });
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'uploadProductPicture - unknownError'));
    }
  }

  async uploadCategoryPicture(req, res, next) {
    try {
      const { img } = req.files;
      const userId = req.user.id;
      const { categoryId } = req.body;

      if (!checkIsUserIsAdmin(userId) || !img || !checkIsValuePositiveNumber(categoryId)) {
        return next(ApiError.badRequest('uploadCategoryPicture - request denied'));
      }

      const fileName = uuid.v4() + '.jpg';
      await img.mv(path.resolve(__dirname, '..', 'static', fileName));
      const picture = await Picture.create({
        fileName,
        categoryId,
      });
      return res.json({ picture });
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'uploadCategoryPicture - unknownError')
      );
    }
  }

  async deletePicture(req, res, next) {
    try {
      const { fileName } = req.body;
      const picture = await Picture.findOne({ where: { fileName: fileName } });
      if (!picture) {
        return next(ApiError.badRequest(`deletePicture - request denied 1`));
      }

      const userId = req.user.id;
      if (!checkIsUserIsAdmin(userId)) {
        const productId = picture.productId;
        const manufacturerCandidate = await checkIsUserManufacturerForProduct({ userId, productId });
        if (!manufacturerCandidate) {
          return next(ApiError.badRequest('deletePicture - request denied 2'));
        }
      }

      fs.unlinkSync(path.resolve(__dirname, '..', 'static', fileName));
      const result = await Picture.destroy({ where: { fileName: fileName } });

      return res.json({ fileName, result });
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deletePicture - unknownError'));
    }
  }
}

module.exports = new PictureController();
