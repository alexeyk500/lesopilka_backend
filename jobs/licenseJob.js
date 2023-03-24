const { LicenseAction } = require('../models/licenseModels');
const { Product, DepublishedProduct } = require('../models/productModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { Op } = require('sequelize');
const { updateModelsField } = require('../utils/functions');
const { makeMailData, transporter } = require('../nodemailer/nodemailer');
const { getLicensesRunOutHTML } = require('../nodemailer/getLicensesRunOutHTML');

const depublishProductsByManufacturerId = async (manufacturerId) => {
  try {
    const lastLicenseAction = await LicenseAction.findOne({
      where: { manufacturerId },
      order: [['actionDate', 'DESC']],
    });

    const { activeProductCardAmount } = await getProductCardsAmountsByManufacturerId(manufacturerId);

    if (activeProductCardAmount > 0 && lastLicenseAction.restLicenseAmount <= 0) {
      const newDate = new Date();
      const depublishedDate = newDate.toISOString();
      const products = await Product.findAll({
        where: { manufacturerId, publicationDate: { [Op.ne]: null } },
        order: [['id']],
      });
      if (products.length > 0) {
        for (let product of products) {
          await updateModelsField(product, { publicationDate: null });
          await DepublishedProduct.create({
            depublishedDate,
            productId: product.id,
          });
        }
      }
    }
  } catch (e) {
    console.log('Error in depublishProductsByManufacturerId', e);
  }
};
const redeemLicenseByManufacturerId = async (manufacturerId) => {
  try {
    const newDate = new Date();
    const actionDate = newDate.toISOString();

    const { activeProductCardAmount, draftProductCardAmount } = await getProductCardsAmountsByManufacturerId(
      manufacturerId
    );

    const lastLicenseAction = await LicenseAction.findOne({
      where: { manufacturerId },
      order: [['actionDate', 'DESC']],
    });
    let restLicenseAmount;
    let redeemLicenseAmount;
    if (!lastLicenseAction) {
      restLicenseAmount = 0;
    } else {
      if (lastLicenseAction.restLicenseAmount > 0) {
        restLicenseAmount = lastLicenseAction.restLicenseAmount - activeProductCardAmount;
        redeemLicenseAmount = activeProductCardAmount;
      } else {
        restLicenseAmount = 0;
      }
    }
    await LicenseAction.create({
      actionDate,
      restLicenseAmount,
      redeemLicenseAmount,
      activeProductCardAmount,
      draftProductCardAmount,
      manufacturerId,
    });
  } catch (e) {
    console.log(`Error in redeemLicenseByManufacturerId, manufacturerId = ${manufacturerId}`, e);
  }
};
const informLicensesRunOutByManufacturerId = async (manufacturerId) => {
  try {
    const lastLicenseAction = await LicenseAction.findOne({
      where: { manufacturerId },
      order: [['actionDate', 'DESC']],
    });

    const { activeProductCardAmount } = await getProductCardsAmountsByManufacturerId(manufacturerId);

    if (activeProductCardAmount > 0 && lastLicenseAction.restLicenseAmount <= 0) {
      const products = await Product.findAll({
        where: { manufacturerId, publicationDate: { [Op.ne]: null } },
        order: [['id']],
      });

      if (products.length > 0) {
        const manufacturer = await Manufacturer.findOne({ where: { id: manufacturerId } });
        if (manufacturer.email) {
          const subject = `Сообщение об исчерпании запаса лицензий на ${process.env.SITE_NAME}`;
          const html = getLicensesRunOutHTML(manufacturer.title ?? manufacturer.email);
          if (html) {
            const mailData = makeMailData({ to: manufacturer.email, subject, html });
            await transporter.sendMail(mailData, async function (err, info) {
              if (err) {
                console.log('Error with sending licenses run out letter', err);
              } else {
                console.log(
                  `sendMail for manufacturerId=${manufacturerId}: ${mailData.from} -> ${mailData.to} "${mailData.subject}"`
                );
              }
            });
          }
        }
      }
    }
  } catch (e) {
    console.log('Error in depublishProductsByManufacturerId', e);
  }
};

const doJobForManufacturers = async (job) => {
  try {
    const manufacturers = await Manufacturer.findAll({ order: [['id']] });
    if (manufacturers.length > 0) {
      for (let manufacturer of manufacturers) {
        await job(manufacturer.id);
      }
    }
  } catch (e) {
    console.log('Error in doJobForManufacturers', e);
  }
};

const getProductCardsAmountsByManufacturerId = async (manufacturerId) => {
  const allProducts = await Product.findAll({ where: { manufacturerId } });
  const activeProductCards = allProducts.filter((product) => product.publicationDate !== null);
  const activeProductCardAmount = activeProductCards.length;
  const draftProductCardAmount = allProducts.length - activeProductCardAmount;
  return { activeProductCardAmount, draftProductCardAmount };
};

module.exports = {
  doJobForManufacturers,
  redeemLicenseByManufacturerId,
  depublishProductsByManufacturerId,
  informLicensesRunOutByManufacturerId,
  getProductCardsAmountsByManufacturerId,
};
