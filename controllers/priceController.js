const ApiError = require('../error/apiError');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const mustache = require('mustache');
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
  getProductSizesStr,
} = require('../utils/priceListFunctions');
const { checkIsValuePositiveNumber } = require("../utils/checkFunctions");

class PriceController {
  async getPrice(req, res, next) {
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

      const searchParams = {};
      searchParams.publicationDate = { [Op.not]: null };
      searchParams.manufacturerId = mid;
      const products = await Product.findAll({
        where: searchParams,
        include: [SubCategory, ProductMaterial, ProductSort],
      });

      const nowDate = new Date().toISOString();
      const priceProducts = products.map((product) => formatProduct(product));
      const subCategories = await SubCategory.findAll();
      const groupedProducts = groupProducts(priceProducts, subCategories);
      const priceSections = groupedProducts.map((section) => {
        const subCategory = section[0].subCategory.title;
        const isDried = section[0].isDried || false;
        const isSeptic = section[0].isSeptic || false;
        let title = subCategory ? `${subCategory} (` : 'Пиломатериал без выбранной категории (';
        if (isDried) {
          title += 'камерная сушка';
        } else {
          title += 'естественная влажность';
        }
        if (isSeptic) {
          title += ', септирован';
        }
        title += ')';
        const products = section.map((product) => {
          return {
            size: getProductSizesStr(product),
            material: product.material ? product.material.title : '',
            sort: product.sort ? product.sort.title : '',
            code: product.code ? product.code : '',
            price: product.price ? product.price : '',
          };
        });
        return { title, products };
      });
      const priceData = {
        nowDate: formatUTCtoDDMonthYear(nowDate),
        manufacturerTitle: `${manufacturer.title}, ИНН: ${manufacturer.inn}`,
        manufacturerAddress: getManufacturerAddress(manufacturer),
        manufacturerEmail: `${manufacturer.email}`,
        manufacturerPhone: `${manufacturer.phone}`,
        image: `${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/logo.png`,
        priceSections,
      };
      const priceTemplatePath = path.resolve(__dirname, '..', 'templates', 'priceTemplate.html');
      const priceTemplate = fs.readFileSync(priceTemplatePath, { encoding: 'utf8' });
      const priceHTML = mustache.render(priceTemplate, priceData);

      // console.log('priceHTML =', priceHTML);
      //
      // res.writeHead(200, { 'Content-Type':'text/html'});
      // res.end(priceHTML);


      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(priceHTML, { waitUntil: 'domcontentloaded' });
      await page.emulateMediaType('screen');
      const pdf = await page.pdf({
        // path: 'result.pdf',
        margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
        preferCSSPageSize: true,
        printBackground: true,
        format: 'A4',
      });
      await browser.close();

      res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
      res.send(pdf)
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }
}

module.exports = new PriceController();
