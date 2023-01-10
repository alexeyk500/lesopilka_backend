const ApiError = require('../error/apiError');
const { PaymentMethod, DeliveryMethod } = require('../models/orderModels');
const { ManufacturerPickUpAddress, Location, Region } = require('../models/addressModels');
const { formatAddress } = require('../utils/functions');
const { User } = require('../models/userModels');

class OrderController {
  async getPaymentMethods(req, res, next) {
    try {
      const paymentMethods = await PaymentMethod.findAll({ order: [['id']] });
      return res.json(paymentMethods);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getDeliveryMethods(req, res, next) {
    try {
      const deliveryMethod = await DeliveryMethod.findAll({ order: [['id']] });
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

  async createNewOrder(req, res, next) {
    try {
      const { date, name, phone, address, locationId, paymentMethodId, deliveryMethodId } = req.body;
      if (!date || !name || !phone || !address || !locationId || !paymentMethodId || !deliveryMethodId) {
        return next(ApiError.internal('Create new order - request data is not complete'));
      }
      const email = req.user.email;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return next(ApiError.internal('Create new order - user not found'));
      }
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new OrderController();
