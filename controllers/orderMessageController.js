const ApiError = require('../error/apiError');
const { OrderMessage } = require('../models/orderMessageModels');
const { Order } = require('../models/orderModels');
const { getManufacturerIdForUser } = require('../utils/functions');
const {
  checkIsValueBoolean,
  checkIsValuePositiveNumber,
  checkIsUserOwnerForOrder,
  checkIsUserManufacturerForOrder,
} = require('../utils/checkFunctions');
const { MessageFromToOptions } = require('../utils/constants');
const { sendNewMessageForOrder } = require('../utils/ordersFunctions');

class OrderMessageController {
  async createNewOrderMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId, isManufacturerMessage, messageText } = req.body;
      if (!orderId || !messageText || !checkIsValueBoolean(isManufacturerMessage)) {
        return next(ApiError.badRequest('createNewOrderMessage - request denied 1'));
      }
      if (!checkIsValuePositiveNumber(orderId)) {
        return next(ApiError.badRequest('createNewOrderMessage - request denied 2'));
      }
      const order = await Order.findOne({ where: { id: orderId } });
      if (!order) {
        return next(ApiError.badRequest(`createNewOrderMessage - request denied 3`));
      }
      let newOrderMessage;
      const newDate = new Date();
      const messageDate = newDate.toISOString();
      if (isManufacturerMessage) {
        const isManufacturer = await checkIsUserManufacturerForOrder(userId, orderId);
        if (!isManufacturer) {
          return next(ApiError.badRequest(`createNewOrderMessage - request denied 4`));
        }
        const manufacturerId = await getManufacturerIdForUser(userId);
        newOrderMessage = await OrderMessage.create({ messageDate, manufacturerId, orderId, messageText });
        if (!newOrderMessage) {
          return next(ApiError.badRequest(`createNewOrderMessage - request denied 5`));
        }
      } else {
        const isUserOwnerForOrder = checkIsUserOwnerForOrder(userId, order);
        if (!isUserOwnerForOrder) {
          return next(ApiError.badRequest(`createNewOrderMessage - request denied 6`));
        }
        newOrderMessage = await OrderMessage.create({ messageDate, userId, orderId, messageText });
        if (!newOrderMessage) {
          return next(ApiError.badRequest(`createNewOrderMessage - request denied 7`));
        }
      }

      await sendNewMessageForOrder({
        orderId,
        messageFromTo: isManufacturerMessage
          ? MessageFromToOptions.ManufacturerToUser
          : MessageFromToOptions.UserToManufacturer,
        messageText,
        next,
      });

      return res.json({ message: newOrderMessage });
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }

  async getOrderMessages(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      if (!checkIsValuePositiveNumber(orderId)) {
        return next(ApiError.badRequest('getOrderMessages - request denied 1'));
      }
      const order = await Order.findOne({ where: { id: orderId } });
      if (!order) {
        return next(ApiError.badRequest(`getOrderMessages - request denied 2`));
      }
      const isUserOwnerForOrder = checkIsUserOwnerForOrder(userId, order);
      if (!isUserOwnerForOrder) {
        const isUserManufacturerForOrder = await checkIsUserManufacturerForOrder(userId, orderId);
        if (!isUserManufacturerForOrder) {
          return next(ApiError.badRequest(`getOrderMessages - request denied 3`));
        }
      }
      const messages = await OrderMessage.findAll({ where: { orderId }, order: ['messageDate'] });
      return res.json(messages);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unknownError'));
    }
  }
}

module.exports = new OrderMessageController();
