const uuid = require('uuid');
const path = require('path');
const ApiError = require('../error/apiError');
const { Picture } = require('../models/pictureModels');

class PictureController {
  async uploadPicture(req, res, next) {
    try {
      const { category_id, sub_category_id, product_id } = req.body;
      const { img } = req.files;
      if (!img || !(!!category_id || !!sub_category_id || !!product_id)) {
        return next(ApiError.badRequest('Not valid data for uploadPicture'));
      }
      const fileName = uuid.v4() + '.jpg';
      await img.mv(path.resolve(__dirname, '..', 'static', fileName));
      const picture = await Picture.create({
        file_name: fileName,
        categoryId: category_id,
        subCategoryId: sub_category_id,
        productId: product_id,
      });
      return res.json({ picture });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new PictureController();
