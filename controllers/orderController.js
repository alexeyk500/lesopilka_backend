const ApiError = require('../error/apiError');
const { PaymentMethod, DeliveryMethod } = require('../models/orderModels');
const { ManufacturerPickUpAddress, Location, Region } = require('../models/addressModels');
const { formatAddress } = require('../utils/functions');

class OrderController {
  async getPaymentMethods(req, res, next) {
    try {
      const paymentMethods = await PaymentMethod.findAll();
      return res.json(paymentMethods);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getDeliveryMethods(req, res, next) {
    try {
      const deliveryMethod = await DeliveryMethod.findAll();
      return res.json(deliveryMethod);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getManufacturerPickUpAddress(req, res, next) {
    try {
      const { mid } = req.params;
      if (!mid) {
        return next(ApiError.badRequest('getManufacturerPickUpAddress - request data is not complete'));
      }
      const manufacturerPickUpAddress = await ManufacturerPickUpAddress.findOne({
        where: { manufacturerId: mid },
        include: [{ model: Location, include: [{ model: Region }] }],
      });
      const address = formatAddress(manufacturerPickUpAddress);
      return res.json({ address });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new OrderController();
