const ApiError = require('../error/apiError');
const { OrderMessage } = require('../models/orderMessageModels');
const { Order } = require("../models/orderModels");
const { checkManufacturerForOrder, getManufacturerIdForUser } = require("../utils/functions");

class OrderMessageController {
  async createNewOrderMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId, isManufacturerMessage, messageText } = req.body;
      if (!orderId || !messageText) {
        return next(ApiError.badRequest('createNewOrderMessage - request data is not complete'));
      }
      const order = await Order.findOne({ where: { id: orderId } });
      if (!order) {
        return next(ApiError.badRequest(`createNewOrderMessage - order with id=${orderId} does not exist`));
      }
      let newOrderMessage;
      const newDate = new Date();
      const messageDate = newDate.toISOString();
      if (!!isManufacturerMessage) {
        const isManufacturer = await checkManufacturerForOrder(userId, orderId);
        if (!isManufacturer) {
          return next(ApiError.badRequest(`createNewOrderMessage - only manufacturer could create message as manufacturer`));
        }
        const manufacturerId = await getManufacturerIdForUser(userId);
        newOrderMessage = await OrderMessage.create({messageDate, manufacturerId, orderId, messageText})
        if (!newOrderMessage) {
          return next(ApiError.badRequest(`createNewOrderMessage - dataBase creating error 1`));
        }
      } else {
        if (order.userId !== userId) {
          return next(
            ApiError.badRequest(`createNewOrderMessage - user with id=${userId} is not owner for Order with id=${orderId}`)
          );
        }
        newOrderMessage = await OrderMessage.create({messageDate, userId, orderId, messageText})
        if (!newOrderMessage) {
          return next(ApiError.badRequest(`createNewOrderMessage - dataBase creating error 2`));
        }
      }
      return res.json({ message: newOrderMessage });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getOrderMessages(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      if (!orderId) {
        return next(ApiError.badRequest('getOrderMessages - request data is not complete'));
      }
      const order = await Order.findOne({ where: { id: orderId } });
      if (!order) {
        return next(ApiError.badRequest(`getOrderMessages - order with id=${orderId} does not exist`));
      }
      return res.json({ userId, orderId });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new OrderMessageController();
