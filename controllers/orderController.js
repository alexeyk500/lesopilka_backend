const ApiError = require('../error/apiError');
const { PaymentMethod } = require('../models/orderModels');

class OrderController {
  async getPaymentMethods(req, res, next) {
    try {
      const paymentMethods = await PaymentMethod.findAll();
      return res.json(paymentMethods);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new OrderController();
