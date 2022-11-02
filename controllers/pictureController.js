const uuid = require('uuid');
const path = require('path');
const ApiError = require('../error/apiError');
const { Picture } = require('../models/pictureModels');

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
      const picture = await Picture.create({
        fileName,
        categoryId,
        productId,
      });
      return res.json({ picture });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new PictureController();
