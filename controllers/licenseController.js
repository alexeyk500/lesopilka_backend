const ApiError = require('../error/apiError');
const { checkIsValuePositiveNumber } = require('../utils/checkFunctions');
const { LicensePrice, ReceiptTransaction, LicenseAction } = require('../models/licenseModels');
const { getManufacturerIdForUser } = require('../utils/functions');
const { Product } = require("../models/productModels");

const getProductCardsAmountsByManufacturerId = async (manufacturerId) => {
  console.log({manufacturerId});
  const allProducts = await Product.findAll({where: manufacturerId});
  console.log('allProducts.length', allProducts.length);
  console.log('allProducts =', allProducts);
  const activeProductCards = allProducts.filter(product=> product.publicationDate !== null);
  const activeProductCardAmount = activeProductCards.length
  const draftProductCardAmount = allProducts.length - activeProductCardAmount
  return {activeProductCardAmount, draftProductCardAmount}
}

class LicenseController {
  async licensePurchase(req, res, next) {
    try {
      const userId = req.user.id;
      const { receiptSum } = req.body;
      if (!userId || !checkIsValuePositiveNumber(receiptSum)) {
        return next(ApiError.badRequest('licensePurchase - request denied 1'));
      }

      const manufacturerId = await getManufacturerIdForUser(userId);
      if (!manufacturerId) {
        return next(ApiError.badRequest('licensePurchase - request denied 2'));
      }

      const lastLicensePrice = await LicensePrice.findOne({ order: [['priceDate', 'DESC']] });
      const licensePrice = lastLicensePrice.licensePrice;
      if (!licensePrice) {
        return next(ApiError.badRequest('licensePurchase - request denied 3'));
      }

      const licenseAmount = Math.round(receiptSum / licensePrice);
      if (licenseAmount <= 0) {
        return next(ApiError.badRequest('licensePurchase - request denied 4'));
      }

      const newDate = new Date();
      const receiptDate = newDate.toISOString();

      const newReceiptTransaction = await ReceiptTransaction.create({
        receiptDate,
        receiptSum,
        licenseAmount,
        licensePrice,
        manufacturerId,
      });
      if (!newReceiptTransaction) {
        return next(ApiError.badRequest('licensePurchase - request denied 5'));
      }

      const lastLicenseAction = await LicenseAction.findOne({ where:{manufacturerId}, order: [['actionDate', 'DESC']] });
      let  restLicenseAmount;
      if (!lastLicenseAction) {
        restLicenseAmount = licenseAmount
      } else {
        restLicenseAmount = lastLicenseAction.restLicenseAmount + licenseAmount
      }

      const { activeProductCardAmount, draftProductCardAmount } = await getProductCardsAmountsByManufacturerId(manufacturerId);

      const newLicenseAction = await LicenseAction.create({
        actionDate: receiptDate,
        restLicenseAmount,
        purchaseLicenseAmount: licenseAmount,
        activeProductCardAmount,
        draftProductCardAmount,
        manufacturerId,
        receiptTransactionId: newReceiptTransaction.id
      });
      if (!newLicenseAction) {
        return next(ApiError.badRequest('licensePurchase - request denied 6'));
      }

      return res.json({ message: newLicenseAction });
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }
}

module.exports = new LicenseController();
