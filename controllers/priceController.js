const ApiError = require('../error/apiError');
const path = require('path');
const fs = require('fs');
const { Manufacturer } = require('../models/manufacturerModels');
const { Address, Location, Region } = require('../models/addressModels');
const { formatProduct } = require('../utils/productFunctions');
const { Product, ProductMaterial, ProductSort } = require('../models/productModels');
const { SubCategory } = require('../models/categoryModels');
const { Op } = require('sequelize');
const {
  groupProducts,
  formatUTCtoDDMonthYear,
  getManufacturerAddress,
  bitmapToBase64,
  createPDF,
  getPriceSections,
} = require('../utils/priceListFunctions');
const { checkIsValuePositiveNumber } = require('../utils/checkFunctions');

class PriceController {
  async getPricePDF(req, res, next) {
    try {
      const { mid } = req.params;
      if (!checkIsValuePositiveNumber(mid)) {
        return next(ApiError.badRequest('getPrice - not complete data'));
      }
      const manufacturer = await Manufacturer.findOne({
        where: { id: mid },
        include: {
          model: Address,
          required: true,
          include: {
            model: Location,
            required: true,
            include: {
              model: Region,
            },
          },
        },
        required: true,
      });
      if (!manufacturer) {
        return next(ApiError.badRequest(`getPrice - could not find manufacturer with id=${mid}`));
      }

      const products = await Product.findAll({
        where: { publicationDate: { [Op.not]: null }, manufacturerId: mid },
        include: [SubCategory, ProductMaterial, ProductSort],
      });

      console.log({ products });

      const nowDate = new Date().toISOString();
      const priceProducts = products.map((product) => formatProduct(product));
      console.log({ priceProducts });
      const subCategories = await SubCategory.findAll();
      const groupedProducts = groupProducts(priceProducts, subCategories);
      console.log({ groupedProducts });
      const priceSections = getPriceSections(groupedProducts);

      console.log({ priceSections });

      const priceLogoPath = path.resolve(__dirname, '..', 'templates', 'priceLogo.png');
      const bitmapPriceLogo = fs.readFileSync(priceLogoPath);
      const priceLogoBase64 = 'data:image/png;base64,' + bitmapToBase64(bitmapPriceLogo);

      const priceData = {
        nowDate: formatUTCtoDDMonthYear(nowDate),
        manufacturerTitle: `${manufacturer.title}, ИНН: ${manufacturer.inn}`,
        manufacturerAddress: getManufacturerAddress(manufacturer),
        manufacturerEmail: `${manufacturer.email}`,
        manufacturerPhone: `${manufacturer.phone}`,
        logo: priceLogoBase64,
        priceSections,
      };

      const priceTemplatePath = path.resolve(__dirname, '..', 'templates', 'priceTemplate.html');
      const priceTemplate = fs.readFileSync(priceTemplatePath, { encoding: 'utf8' });

      const pdf = await createPDF(priceData, priceTemplate);
      res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length });
      res.send(pdf);
    } catch (e) {
      const errorMessage = e.message ? e.message : e?.original?.detail ? e.original.detail : 'unknownError';
      return next(ApiError.badRequest(`getPricePDF - ${errorMessage}`));
    }
  }
}

module.exports = new PriceController();
