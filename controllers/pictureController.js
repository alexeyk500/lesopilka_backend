const uuid = require('uuid');
const path = require('path');
const ApiError = require('../error/apiError');
const { Picture } = require('../models/pictureModels');
const { checkManufacturerForProduct } = require('../utils/functions');

class PictureController {
  async uploadPicture(req, res, next) {
    try {
      const { categoryId, productId } = req.body;
      const { img } = req.files;
      if (!img || !(!!categoryId || !!productId)) {
        return next(ApiError.badRequest('Not valid data for uploadPicture'));
      }
      const fileName = uuid.v4() + '.jpg';
      await img.mv(path.resolve(__dirname, '..', 'static', fileName));
      const productPictures = await Picture.findAll({ where: { productId } });
      let order = 1;
      for (const curPicture of productPictures) {
        if (curPicture.order) {
          order += 1;
        }
      }
      const picture = await Picture.create({
        fileName,
        categoryId,
        productId,
        order,
      });
      return res.json({ picture });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async deletePicture(req, res, next) {
    try {
      const { fileName } = req.body;
      const picture = await Picture.findOne({ where: { fileName: fileName } });
      if (!picture) {
        return next(ApiError.badRequest(`Image with fileName=${fileName} does not exist`));
      }
      const productId = picture.productId;
      if (!productId) {
        return next(ApiError.badRequest(`Could not find product for image with fileName=${fileName}`));
      }
      const checkResult = await checkManufacturerForProduct(req.user.id, productId);
      if (!checkResult) {
        return next(ApiError.badRequest('Only manufacturer could edit the product'));
      }
      const result = await Picture.destroy({ where: { fileName: fileName } });
      return res.json({ fileName, result });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new PictureController();
