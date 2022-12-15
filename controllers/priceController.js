const ApiError = require('../error/apiError');
const path = require('path');
const fs = require('fs');
const pdf = require('html-pdf');
const mustache = require('mustache');
const { User } = require('../models/userModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { Address, Location, Region } = require('../models/addressModels');
const { formatProduct } = require('../utils/functions');
const { Product, ProductMaterial, ProductSort } = require('../models/productModels');
const { SubCategory } = require('../models/categoryModels');
const { Op } = require('sequelize');
const {
  groupProducts,
  formatUTCtoDDMonthYear,
  getManufacturerAddress,
  getProductSizesStr,
} = require('../utils/priceListFunctions');

class PriceController {
  async getPrice(req, res, next) {
    try {
      const { mid } = req.params;
      if (!mid) {
        return next(ApiError.badRequest('getPrice - not complete data'));
      }
      const manufacturer = await Manufacturer.findOne({
        where: { id: mid },
        required: true,
      });
      if (!manufacturer) {
        return next(ApiError.badRequest(`getPrice - could not find manufacturer with id=${mid}`));
      }
      const userId = manufacturer.userId;
      const user = await User.findOne({
        where: { id: userId },
        include: [
          {
            model: Manufacturer,
            required: true,
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
          },
        ],
      });
      if (!user) {
        return next(ApiError.badRequest('getPrice - could not find user with id=${userId}'));
      }

      const nowDate = new Date().toISOString();

      const searchParams = {};
      searchParams.publicationDate = { [Op.not]: null };
      searchParams.manufacturerId = mid;

      const products = await Product.findAll({
        where: searchParams,
        include: [SubCategory, ProductMaterial, ProductSort],
      });

      console.log(products.length);

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
          title += ' ,септирован';
        }
        title += ' )';
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

      console.log({ priceSections });

      const priceData = {
        nowDate: formatUTCtoDDMonthYear(nowDate),
        manufacturerTitle: `${user.manufacturer.title}, ИНН: ${user.manufacturer.inn}`,
        manufacturerAddress: getManufacturerAddress(user.manufacturer),
        manufacturerEmail: `${user.manufacturer.email}`,
        manufacturerPhone: `${user.manufacturer.phone}`,
        image: 'http://localhost:5001/logo.png',
        priceSections,
      };

      // console.log('priceData =', priceData);

      const priceTemplatePath = path.resolve(__dirname, '..', 'templates', 'priceTemplate.html');
      const priceTemplate = fs.readFileSync(priceTemplatePath, { encoding: 'utf8' });

      const filledPriceTemplate = mustache.render(priceTemplate, priceData);
      // console.log('filledPriceTemplate =', filledPriceTemplate);

      const options = { format: 'A4' };
      pdf.create(filledPriceTemplate, options).toStream(function (err, stream) {
        if (err) {
          res.send(err);
        } else {
          res.setHeader('Content-disposition', 'inline; filename="price"');
          res.setHeader('Content-type', 'application/pdf');
          stream.pipe(res);
        }
      });

      // pdf.create(priceTemplate, options).toFile("report.pdf", function (err, data) {
      //   if (err) {
      //     res.send(err);
      //   } else {
      //     console.log('data', data)
      //     res.sendFile(data.filename)
      //     // const priceFilePath = path.resolve(__dirname, 'report.pdf')
      //     // console.log('priceFilePath =', priceFilePath)
      //     // res.send("File created successfully");
      //   }
      // });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new PriceController();
