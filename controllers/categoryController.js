const { Category, SubCategory, CategoryClass, CategorySize } = require('../models/categoryModels');
const ApiError = require('../error/apiError');

class CategoryController {
  async createCategory(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) {
        return next(ApiError.badRequest('createCategory - not complete data'));
      }
      const order = (await Category.max('order')) + 1;
      const category = await Category.create({ name, order });
      return res.json(category);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async createSubCategory(req, res, next) {
    try {
      const { name, category_id } = req.body;
      if (!name || !category_id) {
        return next(ApiError.badRequest('createSubCategory - not complete data'));
      }
      const order = (await SubCategory.max('order')) + 1;
      const subCategory = await SubCategory.create({ name, categoryId: category_id, order });
      return res.json(subCategory);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getAllCategories(req, res) {
    const categories = await Category.findAll();
    return res.json(categories);
  }

  async getAllSubCategories(req, res) {
    const categories = await SubCategory.findAll();
    return res.json(categories);
  }

  async createCategoryClass(req, res, next) {
    try {
      const { name, category_id } = req.body;
      if (!name || !category_id) {
        return next(ApiError.badRequest('createProductClass - not complete data'));
      }
      const order = (await CategoryClass.max('order')) + 1;
      const categoryClass = await CategoryClass.create({ name, categoryId: category_id, order });
      return res.json(categoryClass);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getAllCategoryClasses(req, res) {
    const categories = await CategoryClass.findAll();
    return res.json(categories);
  }

  async createCategorySize(req, res, next) {
    try {
      const { type, value, category_id } = req.body;
      if (!type || !value || !category_id) {
        return next(ApiError.badRequest('createCategorySize - not complete data'));
      }
      const order = (await CategorySize.max('order')) + 1;
      const categorySize = await CategorySize.create({ type, value, categoryId: category_id, order });
      return res.json(categorySize);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getAllCategorySizes(req, res) {
    const categories = await CategorySize.findAll();
    return res.json(categories);
  }
}

module.exports = new CategoryController();
