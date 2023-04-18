const fs = require('fs');
const path = require('path');
const ApiError = require('../error/apiError');
const { Product, ProductDescription, ProductMaterial, ProductSort } = require('../models/productModels');
const { SubCategory } = require('../models/categoryModels');
const { Picture } = require('../models/pictureModels');
const { Basket } = require('../models/basketModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { Address, Location, Region } = require('../models/addressModels');
const { updateModelsField } = require('../utils/functions');
const { SizeTypeEnum, PRODUCTS_PAGE_SIZE } = require('../utils/constants');
const { Op } = require('sequelize');
const { checkIsUserManufacturerForProduct, checkIsValuePositiveNumber } = require('../utils/checkFunctions');
const { formatProduct, getProductResponse } = require('../utils/productFunctions');

class ProductController {
  async updateProduct(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        productId,
        subCategoryId,
        productMaterialId,
        code,
        price,
        isSeptic,
        isDried,
        publicationDate,
        productSortId,
        productResetAllSizes,
        sizeType,
        sizeValue,
      } = req.body;

      if (!productId || !userId) {
        return next(ApiError.badRequest('updateProduct - request denied 1'));
      }

      const checkManufacturer = await checkIsUserManufacturerForProduct({ userId, productId });
      if (!checkManufacturer) {
        return next(ApiError.badRequest('updateProduct - request denied 2'));
      }

      const product = await Product.findOne({ where: { id: productId } });
      if (!product) {
        return next(ApiError.badRequest(`updateProduct - request denied 3`));
      }
      if (subCategoryId === null || subCategoryId) {
        await updateModelsField(product, { subCategoryId: subCategoryId });
      }
      if (productMaterialId === null || productMaterialId) {
        await updateModelsField(product, { productMaterialId: productMaterialId });
      }
      if (productSortId === null || productSortId) {
        await updateModelsField(product, { productSortId: productSortId });
      }
      if (isSeptic === null || isSeptic) {
        await updateModelsField(product, { isSeptic: !!isSeptic });
      }
      if (isDried === null || isDried) {
        await updateModelsField(product, { isDried: !!isDried });
      }

      if (sizeType && (sizeValue || sizeValue === null)) {
        if (sizeType === SizeTypeEnum.height || sizeType === SizeTypeEnum.width) {
          await updateModelsField(product, { [sizeType]: sizeValue });
          if (product[SizeTypeEnum.caliber] !== null) {
            await updateModelsField(product, { [SizeTypeEnum.caliber]: null });
          }
        }
        if (sizeType === SizeTypeEnum.caliber) {
          await updateModelsField(product, { [sizeType]: sizeValue });
          if (product[SizeTypeEnum.height] !== null) {
            await updateModelsField(product, { [SizeTypeEnum.height]: null });
          }
          if (product[SizeTypeEnum.width] !== null) {
            await updateModelsField(product, { [SizeTypeEnum.width]: null });
          }
        }
        if (sizeType === SizeTypeEnum.length) {
          await updateModelsField(product, { [sizeType]: sizeValue });
        }
      }

      if (productResetAllSizes) {
        if (product[SizeTypeEnum.height] !== null) {
          await updateModelsField(product, { [SizeTypeEnum.height]: null });
        }
        if (product[SizeTypeEnum.width] !== null) {
          await updateModelsField(product, { [SizeTypeEnum.width]: null });
        }
        if (product[SizeTypeEnum.caliber] !== null) {
          await updateModelsField(product, { [SizeTypeEnum.caliber]: null });
        }
        if (product[SizeTypeEnum.length] !== null) {
          await updateModelsField(product, { [SizeTypeEnum.length]: null });
        }
      }

      if (code === null || code) {
        await updateModelsField(product, { code: code });
      }
      if (price === null || price) {
        await updateModelsField(product, { price: price });
      }
      if (publicationDate === null || publicationDate) {
        const newPublicationDate = publicationDate ? new Date().toISOString() : null;
        await updateModelsField(product, { publicationDate: newPublicationDate });
      }

      const editionDate = new Date().toISOString();
      await updateModelsField(product, { editionDate });
      const response = await getProductResponse(productId, req.protocol, req.headers.host);
      return res.json(response);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'updateProduct - unknownError'));
    }
  }

  async productPublication(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      if (!userId || !checkIsValuePositiveNumber(productId)) {
        return next(ApiError.badRequest('productPublication - request denied 1'));
      }

      const checkManufacturer = await checkIsUserManufacturerForProduct({ userId, productId });
      if (!checkManufacturer) {
        return next(ApiError.badRequest('productPublication - request denied 2'));
      }

      const product = await Product.findOne({ where: { id: productId } });
      if (!product) {
        return next(ApiError.badRequest(`productPublication - request denied 3`));
      }

      const dateNow = new Date().toISOString();
      await updateModelsField(product, { publicationDate: dateNow });
      await updateModelsField(product, { editionDate: dateNow });

      const response = await getProductResponse(productId, req.protocol, req.headers.host);
      return res.json(response);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'productPublication - unknownError'));
    }
  }

  async productStopPublication(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      if (!userId || !checkIsValuePositiveNumber(productId)) {
        return next(ApiError.badRequest('productStopPublication - request denied 1'));
      }

      const checkManufacturer = await checkIsUserManufacturerForProduct({ userId, productId });
      if (!checkManufacturer) {
        return next(ApiError.badRequest('productStopPublication - request denied 2'));
      }

      const product = await Product.findOne({ where: { id: productId } });
      if (!product) {
        return next(ApiError.badRequest(`productStopPublication - request denied 3`));
      }

      const dateNow = new Date().toISOString();
      await updateModelsField(product, { publicationDate: null });
      await updateModelsField(product, { editionDate: dateNow });

      const response = await getProductResponse(productId, req.protocol, req.headers.host);
      return res.json(response);
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'productStopPublication - unknownError')
      );
    }
  }

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
      const editionDate = new Date().toISOString();
      const product = await Product.create({
        editionDate,
        manufacturerId,
      });
      await ProductDescription.create({ productId: product.id });
      return res.json(product);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'createProduct - unknownError'));
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
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'createDescription - unknownError'));
    }
  }

  async createProductMaterial(req, res, next) {
    try {
      const { title, isPine } = req.body;
      if (!title) {
        return next(ApiError.badRequest('createProductMaterial - not complete data'));
      }
      const order = (await ProductMaterial.max('order')) + 1;
      const newMaterial = await ProductMaterial.create({ title, isPine, order });
      return res.json(newMaterial);
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'createProductMaterial - unknownError')
      );
    }
  }

  async getAllProductMaterials(req, res, next) {
    try {
      const materials = await ProductMaterial.findAll();
      return res.json(materials);
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'getAllProductMaterials - unknownError')
      );
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      if (!productId) {
        return next(ApiError.badRequest('deleteProduct - not complete data'));
      }
      const checkManufacturer = await checkIsUserManufacturerForProduct({ userId, productId });
      if (!checkManufacturer) {
        return next(ApiError.badRequest('Only manufacturer can delete the product'));
      }
      const pictures = await Picture.findAll({ where: { productId } });
      if (pictures.length > 0) {
        for (const picture in pictures) {
          if (picture && picture.fileName) {
            const fullFileName = path.resolve(__dirname, '..', 'static', picture.fileName);
            await fs.unlink(fullFileName, (res) => console.log(res));
          }
        }
      }
      await ProductDescription.destroy({ where: { productId } });
      await Basket.destroy({ where: { productId } });
      await Picture.destroy({ where: { productId } });
      const result = await Product.destroy({ where: { id: productId } });
      return res.json({ productId, result });
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'deleteProduct - unknownError'));
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
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'createProductSort - unknownError'));
    }
  }

  async getAllProductSorts(req, res, next) {
    try {
      const categories = await ProductSort.findAll();
      return res.json(categories);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'getAllProductSorts - unknownError'));
    }
  }

  async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return next(ApiError.badRequest('getProduct - not complete data'));
      }
      const response = await getProductResponse(id, req.protocol, req.headers.host);
      return res.json(response);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'getProduct - unknownError'));
    }
  }

  async getProducts(req, res, next) {
    try {
      const { mid, cid, scid, sh, sw, sc, sl, psid, dri, sep, slid, srid, pf, pt, sd, page, size, top } = req.query;
      let searchParams = {};
      if (scid && Number(scid) > 0) {
        searchParams.subCategoryId = scid;
      }
      if (!scid && cid && Number(cid > 0)) {
        const subCategories = await SubCategory.findAll({ where: { categoryId: cid } });
        const searchSubCategories = subCategories.map((subCategory) => subCategory.id);
        if (searchSubCategories) {
          searchParams.subCategoryId = searchSubCategories;
        }
      }
      if (mid && Number(mid) > 0) {
        searchParams.manufacturerId = mid;
      }
      if (sh && Number(sh) > 0) {
        searchParams.height = sh;
      }
      if (sw && Number(sw) > 0) {
        searchParams.width = sw;
      }
      if (sc && Number(sc) > 0) {
        searchParams.caliber = sc;
      }
      if (sl && Number(sl) > 0) {
        searchParams.length = sl;
      }
      if (psid && Number(psid) > 0) {
        searchParams.productSortId = psid;
      }
      if (dri && Number(dri) > 0) {
        if (dri === '1') {
          searchParams.isDried = false;
        }
        if (dri === '2') {
          searchParams.isDried = true;
        }
      }
      if (sep && Number(sep) > 0) {
        if (sep === '1') {
          searchParams.isSeptic = false;
        }
        if (sep === '2') {
          searchParams.isSeptic = true;
        }
      }

      let searchParamsLocation = {};
      if (slid && Number(slid) > 0) {
        searchParamsLocation.locationId = slid;
      }
      let searchParamsRegion = {};
      if (!slid && srid && Number(srid) > 0) {
        searchParamsRegion.regionId = srid;
      }

      if (pf || pt) {
        const priceFrom = pf && Number(pf) > 0 ? pf : 0;
        const priceTo = pt && Number(pt) > 0 ? pt : Infinity;
        searchParams.price = { [Op.between]: [priceFrom, priceTo] };
      }

      let productSortParams = ['id', 'ASC'];
      if (sd) {
        if (sd === 'pa') {
          productSortParams = ['price', 'ASC'];
        }
        if (sd === 'pd') {
          productSortParams = ['price', 'DESC'];
        }
      }

      let limit = PRODUCTS_PAGE_SIZE;
      const sizeNumber = Number.parseInt(size);
      if (!Number.isNaN(sizeNumber) && sizeNumber > 0 && sizeNumber < 64) {
        limit = sizeNumber;
      }
      let pageParam = 0;
      const pageNumber = Number.parseInt(page);
      if (!Number.isNaN(pageNumber) && pageNumber > 0 && pageNumber < 1000) {
        pageParam = pageNumber;
      }

      if (!top || (top && top !== 'mp')) {
        searchParams.publicationDate = { [Op.not]: null };
      }

      if (top === 'price') {
        searchParams = {};
        searchParams.manufacturerId = mid;
        limit = 1000;
      }

      const { count, rows } = await Product.findAndCountAll({
        where: searchParams,
        include: [
          ProductDescription,
          SubCategory,
          ProductMaterial,
          ProductSort,
          Picture,
          {
            model: Manufacturer,
            required: true,
            include: {
              model: Address,
              where: searchParamsLocation,
              include: {
                model: Location,
                where: searchParamsRegion,
                include: {
                  model: Region,
                },
              },
            },
          },
        ],
        order: [productSortParams, [Picture, 'order', 'ASC']],
        distinct: true,
        limit,
        offset: pageParam * limit,
      });
      const products = rows.map((prod) => formatProduct(prod, req.protocol, req.headers.host));
      return res.json({
        products,
        totalProducts: count,
        pageSize: limit,
        totalPages: Math.ceil(count / limit),
        currentPage: pageParam,
      });
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'getProducts - unknownError'));
    }
  }

  async updateDescription(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId, description } = req.body;
      if ((!userId && !productId) || (!description && description !== null)) {
        return next(ApiError.badRequest('updateDescription - not complete data'));
      }
      const checkManufacturer = await checkIsUserManufacturerForProduct({ userId, productId });
      if (!checkManufacturer) {
        return next(ApiError.badRequest('Only manufacturer can edit the product'));
      }
      const product = await Product.findOne({ where: { id: productId } });
      if (!product) {
        return next(ApiError.badRequest(`Product with id=${productId} not found`));
      }
      await ProductDescription.update({ description }, { where: { productId } });
      const editionDate = new Date().toISOString();
      await updateModelsField(product, { editionDate });
      const response = await getProductResponse(productId, req.protocol, req.headers.host);
      return res.json(response);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'updateDescription - unknownError'));
    }
  }
}

module.exports = new ProductController();
