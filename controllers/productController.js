const fs = require('fs');
const path = require('path');
const ApiError = require('../error/apiError');
const {
  Product,
  ProductDescription,
  ProductReview,
  ProductSeptic,
  ProductMaterial,
  ProductSort,
} = require('../models/productModels');
const { CategorySize, SubCategory } = require('../models/categoryModels');
const { Picture } = require('../models/pictureModels');
const { Basket } = require('../models/basketModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { Address, Location, Region } = require('../models/addressModels');
const uuid = require('uuid');
const { formatProduct } = require('../utils/functions');

class ProductController {
  async createProduct(req, res, next) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return next(ApiError.badRequest('User not found'));
      }
      const manufacturer = await Manufacturer.findOne({ where: { userId } });
      if (!manufacturer) {
        return next(ApiError.badRequest('Manufacturer not found'));
      }
      const manufacturerId = manufacturer.id;
      console.log('manufacturerId =', manufacturerId);

      const { code, price, isSeptic, subCategoryId, productMaterialId, productSortId, categorySizesIds, description } =
        req.body;
      if (
        !manufacturerId ||
        !code ||
        !price ||
        !subCategoryId ||
        !productMaterialId ||
        !productSortId ||
        !!!categorySizesIds.length
      ) {
        return next(ApiError.badRequest('createProduct - not complete data'));
      }

      const candidate = await Product.findOne({ where: { manufacturerId, code } });
      if (candidate) {
        return next(ApiError.badRequest(`Product with code ${code}, already exist`));
      }

      const editionDate = new Date().toISOString();
      const product = await Product.create({
        code,
        price,
        isSeptic,
        editionDate,
        manufacturerId,
        subCategoryId,
        productMaterialId,
        productSortId,
      });
      for (const categorySizeId of categorySizesIds) {
        const categorySize = await CategorySize.findByPk(categorySizeId);
        await product.addCategorySize(categorySize);
      }

      await ProductDescription.create({ productId: product.id, description });

      let images;
      if (req.files && req.files.images) {
        images = req.files.images;
      }
      const imageFiles = [];
      if (images) {
        if (images.length) {
          images.forEach((img) => {
            imageFiles.push(img);
          });
        } else {
          imageFiles.push(images);
        }
      }
      for (const img of imageFiles) {
        const fileName = uuid.v4() + '.jpg';
        await img.mv(path.resolve(__dirname, '..', 'static', fileName));
        await Picture.create({ fileName, productId: product.id });
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

  async updateDescription(req, res, next) {
    try {
      const { productId, description } = req.body;
      if (!productId) {
        return next(ApiError.badRequest('updateDescription - not complete data'));
      }
      const newDescription = await ProductDescription.update({ description }, { where: { productId } });
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

  async createProductMaterial(req, res, next) {
    try {
      const { title, isPine } = req.body;
      if (!title) {
        return next(ApiError.badRequest('createMaterial - not complete data'));
      }
      const order = (await ProductMaterial.max('order')) + 1;
      const newMaterial = await ProductMaterial.create({ title, isPine, order });
      return res.json(newMaterial);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getAllProductMaterials(req, res) {
    const materials = await ProductMaterial.findAll();
    return res.json(materials);
  }

  async updateReview(req, res, next) {
    try {
      const { productId, review } = req.body;
      if (!productId) {
        return next(ApiError.badRequest('updateReview - not complete data'));
      }
      const newReview = await ProductReview.update({ review }, { where: { productId } });
      return res.json(newReview);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async updateSeptic(req, res, next) {
    try {
      const { productId, isSeptic } = req.body;
      if (!productId) {
        return next(ApiError.badRequest('updateSeptic - not complete data'));
      }
      const oldIsSeptic = await ProductSeptic.findOne({ where: { productId } });
      let result;
      if (isSeptic && !oldIsSeptic) {
        result = await ProductSeptic.create({ productId, value: isSeptic });
      }
      if (!isSeptic && oldIsSeptic) {
        result = await ProductSeptic.destroy({ where: { productId } });
      }
      return res.json(result);
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

  async createProductSort(req, res, next) {
    try {
      const { title } = req.body;
      if (!title) {
        return next(ApiError.badRequest('createProductSort - not complete data'));
      }
      const productSort = await ProductSort.create({ title });
      return res.json(productSort);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getAllProductSorts(req, res) {
    const categories = await ProductSort.findAll();
    return res.json(categories);
  }

  async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return next(ApiError.badRequest('getProduct - not complete data'));
      }
      const product = await Product.findOne({
        where: { id },
        include: [
          { model: ProductDescription },
          { model: SubCategory },
          { model: CategorySize },
          {
            model: Manufacturer,
            include: [{ model: Address, include: [{ model: Location, include: [{ model: Region }] }] }],
          },
          { model: Picture },
        ],
      });
      if (!product) {
        return next(ApiError.badRequest(`Product with id=${id} - was not found`));
      }

      const response = { product: formatProduct(product, req.protocol, req.headers.host) };

      return res.json(response);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new ProductController();
