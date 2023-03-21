const { Category, SubCategory, CategorySize } = require('../models/categoryModels');
const ApiError = require('../error/apiError');
const { Picture } = require('../models/pictureModels');

class CategoryController {
  async createCategory(req, res, next) {
    try {
      const { title } = req.body;
      if (!title) {
        return next(ApiError.badRequest('createCategory - not complete data'));
      }
      const order = (await Category.max('order')) + 1;
      const category = await Category.create({ title, order });
      return res.json(category);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }

  async createSubCategory(req, res, next) {
    try {
      const { title, categoryId } = req.body;
      if (!title || !categoryId) {
        return next(ApiError.badRequest('createSubCategory - not complete data'));
      }
      const order = (await SubCategory.max('order')) + 1;
      const subCategory = await SubCategory.create({ title, categoryId, order });
      return res.json(subCategory);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }

  async getAllCategories(req, res) {
    let fileName;
    const categories = [];
    const categoriesDB = await Category.findAll();
    for (let category of categoriesDB) {
      const id = await category.get('id');
      const title = await category.get('title');
      const order = await category.get('order');
      const picture = await Picture.findOne({ where: { categoryId: id } });
      if (picture) {
        const shortFileName = await picture.get('fileName');
        fileName = req.protocol + '://' + req.headers.host + '/' + shortFileName;
      }
      categories.push({ id, title, image: fileName, order });
    }
    return res.json(categories);
  }

  async getAllSubCategories(req, res) {
    const subCategories = await SubCategory.findAll();
    return res.json(subCategories);
  }

  async createCategorySize(req, res, next) {
    try {
      const { type, value, categoryId } = req.body;
      if (!type || !value || !categoryId) {
        return next(ApiError.badRequest('createCategorySize - not complete data'));
      }
      const order = (await CategorySize.max('order')) + 1;
      const categorySize = await CategorySize.create({ type, value, categoryId, order });
      return res.json(categorySize);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }

  async getAllCategorySizes(req, res) {
    const categorySizes = await CategorySize.findAll();
    return res.json(categorySizes);
  }
}

module.exports = new CategoryController();
