const ApiError = require('../error/apiError');
const { Product } = require('../models/productModels');
const { CategorySize } = require('../models/categoryModels');

class ProductController {
  async createProduct(req, res, next) {
    try {
      const { name, price, subcategory_id, category_size_id } = req.body;
      if (!name || !price) {
        return next(ApiError.badRequest('createProduct - not complete data'));
      }
      const edition_date = new Date().toISOString();
      const product = await Product.create({
        name,
        price,
        edition_date,
        subCategoryId: subcategory_id,
      });
      const categorySize = await CategorySize.findByPk(category_size_id);
      await product.addCategory_size(categorySize);
      return res.json(product);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new ProductController();
