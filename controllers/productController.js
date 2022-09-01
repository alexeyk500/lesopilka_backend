const ApiError = require('../error/apiError');
const { Product, CategorySize_Product, CategorySort_Product, ProductDescription, ProductReview} = require('../models/productModels');
const { CategorySize, SubCategory, Category, CategorySort } = require('../models/categoryModels');

class ProductController {
  async createProduct(req, res, next) {
    try {
      const { title, price, subcategory_id, category_sizes_ids, category_sorts_ids } = req.body;
      if (!title || !price) {
        return next(ApiError.badRequest('createProduct - not complete data'));
      }
      const edition_date = new Date().toISOString();
      const product = await Product.create({
        title,
        price,
        edition_date,
        subCategoryId: subcategory_id,
      });
      for (const category_size_id of category_sizes_ids) {
        const categorySize = await CategorySize.findByPk(category_size_id);
        await product.addCategorySize(categorySize);
      }
      for (const category_sort_id of category_sorts_ids) {
        const categorySort = await CategorySort.findByPk(category_sort_id);
        await product.addCategorySort(categorySort);
      }

      return res.json(product);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async createDescription(req, res, next) {
    try {
      const { product_id, description } = req.body;
      if (!product_id || !description) {
        return next(ApiError.badRequest('createDescription - not complete data'));
      }
      const newDescription = await ProductDescription.create({ productId: product_id, description });
      return res.json(newDescription);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async createReview(req, res, next) {
    try {
      const { product_id, user_id, review } = req.body;
      console.log(product_id, user_id, review)
      if (!product_id || !user_id || !review) {
        return next(ApiError.badRequest('createReview - not complete data'));
      }
      const newReview = await ProductReview.create({ productId: product_id, userId: user_id, review });

      return res.json(newReview);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getProduct(req, res, next) {
    try {
      const { product_id } = req.params;
      if (!product_id) {
        return next(ApiError.badRequest('getProduct - not complete data'));
      }
      const product = await Product.findByPk(product_id);
      const title = await product.get('title');
      const price = await product.get('price');
      const editionDate = await product.get('edition_date');
      const publicationDate = await product.get('publication_date');
      const subCategoryId = await product.get('subCategoryId');
      const subCategory = await SubCategory.findByPk(subCategoryId);
      const categoryId = subCategory.get('categoryId');
      const category = await Category.findByPk(categoryId);
      const subCategoryTitle = subCategory.get('title');
      const categoryTitle = category.get('title');
      const productSizes = await CategorySize_Product.findAll({ where: { productId: product_id } });
      const sizes = [];
      for (const productSize of productSizes) {
        const productSizeId = productSize.get('categorySizeId');
        const size = await CategorySize.findByPk(productSizeId);
        const id = size.get('id');
        const type = size.get('type');
        const value = size.get('value');
        sizes.push({ id, type, value });
      }
      const productSorts = await CategorySort_Product.findAll({ where: { productId: product_id } });
      const sorts = [];
      for (const productSort of productSorts) {
        const productSortId = productSort.get('categorySortId');
        const sort = await CategorySort.findByPk(productSortId);
        const id = sort.get('id');
        const title = sort.get('title');
        sorts.push({ id, title });
      }
      const description = await ProductDescription.findOne({ where: { productId: product_id } });
      const descriptionId = description.get('id');
      const descriptionText = description.get('description');
      return res.json({
        id: product_id,
        title,
        price,
        category: {
          id: categoryId,
          title: categoryTitle,
        },
        subCategory: {
          id: subCategoryId,
          title: subCategoryTitle,
        },
        sizes,
        sorts,
        editionDate,
        publicationDate,
        description : {
          id: descriptionId,
          description: descriptionText
        },
      });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new ProductController();
