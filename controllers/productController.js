const fs = require('fs');
const path = require('path');
const ApiError = require('../error/apiError');
const {
  Product,
  CategorySize_Product,
  CategorySort_Product,
  ProductDescription,
  ProductReview,
  ProductSeptic,
} = require('../models/productModels');
const { CategorySize, SubCategory, Category, CategorySort } = require('../models/categoryModels');
const { Picture } = require('../models/pictureModels');
const { Basket } = require('../models/basketModels');

class ProductController {
  async createProduct(req, res, next) {
    try {
      const { title, price, subcategoryId, categorySizesIds, categorySortsIds, isSeptic } = req.body;
      if (!title || !price || !subcategoryId) {
        return next(ApiError.badRequest('createProduct - not complete data'));
      }
      const editionDate = new Date().toISOString();
      const product = await Product.create({
        title,
        price,
        editionDate,
        subCategoryId: subcategoryId,
      });
      for (const categorySizeId of categorySizesIds) {
        const categorySize = await CategorySize.findByPk(categorySizeId);
        await product.addCategorySize(categorySize);
      }
      for (const categorySortId of categorySortsIds) {
        const categorySort = await CategorySort.findByPk(categorySortId);
        await product.addCategorySort(categorySort);
      }
      if (isSeptic) {
        await ProductSeptic.create({ productId: product.id, value: isSeptic });
      }
      return res.json(product);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async createDescription(req, res, next) {
    try {
      const { productId, description } = req.body;
      if (!productId || !description) {
        return next(ApiError.badRequest('createDescription - not complete data'));
      }
      const newDescription = await ProductDescription.create({ productId, description });
      return res.json(newDescription);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async createReview(req, res, next) {
    try {
      const { productId, user_id, review } = req.body;
      if (!productId || !user_id || !review) {
        return next(ApiError.badRequest('createReview - not complete data'));
      }
      const newReview = await ProductReview.create({ productId, userId: user_id, review });

      return res.json(newReview);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { productId } = req.body;
      if (!productId) {
        return next(ApiError.badRequest('deleteProduct - not complete data'));
      }
      const picture = await Picture.findOne({ where: { productId } });
      if (picture && picture.fileName) {
        const fullFileName = path.resolve(__dirname, '..', 'static', picture.fileName);
        fs.unlink(fullFileName, function (err) {
          if (err) {
            console.log(fullFileName, '- does not exist');
          } else {
            console.log(fullFileName, '- removed');
          }
        });
      }
      await ProductSeptic.destroy({ where: { productId } });
      await ProductDescription.destroy({ where: { productId } });
      await ProductReview.destroy({ where: { productId } });
      await Basket.destroy({ where: { productId } });
      await Picture.destroy({ where: { productId } });
      const result = await Product.destroy({ where: { id: productId } });
      return res.json({ productId, result });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getProduct(req, res, next) {
    try {
      const { productId } = req.params;
      if (!productId) {
        return next(ApiError.badRequest('getProduct - not complete data'));
      }
      const product = await Product.findByPk(productId);
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
      const productSizes = await CategorySize_Product.findAll({ where: { productId } });
      const sizes = [];
      for (const productSize of productSizes) {
        const productSizeId = productSize.get('categorySizeId');
        const size = await CategorySize.findByPk(productSizeId);
        const id = size.get('id');
        const type = size.get('type');
        const value = size.get('value');
        sizes.push({ id, type, value });
      }
      const productSorts = await CategorySort_Product.findAll({ where: { productId } });
      const sorts = [];
      for (const productSort of productSorts) {
        const productSortId = productSort.get('categorySortId');
        const sort = await CategorySort.findByPk(productSortId);
        const id = sort.get('id');
        const title = sort.get('title');
        sorts.push({ id, title });
      }
      const description = await ProductDescription.findOne({ where: { productId } });
      const isSeptic = await ProductSeptic.findOne({ where: { productId } });
      return res.json({
        productId,
        title,
        price,
        categoryTitle,
        subCategoryTitle,
        sizes: sizes
          ? sizes.map((size) => {
              return { type: size.type, value: size.value };
            })
          : null,
        sorts: sorts ? sorts.map((sort) => sort.title) : null,
        editionDate: editionDate ? editionDate : null,
        publicationDate: publicationDate ? publicationDate : null,
        description: description ? description.description : null,
        isSeptic: isSeptic ? isSeptic.value : null,
      });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new ProductController();
