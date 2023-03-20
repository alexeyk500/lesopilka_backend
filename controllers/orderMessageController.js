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
const { getNewOrderMessage } = require('../nodemailer/getNewOrderMessage');
const { makeMailData, transporter } = require('../nodemailer/nodemailer');
const { getManufacturerForOrder, getUserForOrder } = require('../utils/ordersFunctions');

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

      let messageReceiver;
      if (isManufacturerMessage) {
        messageReceiver = await getUserForOrder(orderId);
      } else {
        messageReceiver = await getManufacturerForOrder(orderId);
      }
      if (messageReceiver.email) {
        const subject = `Новое сообщение по заказу № ${orderId} на ${process.env.SITE_NAME}`;
        const html = getNewOrderMessage(orderId, isManufacturerMessage, messageText);
        const mailData = makeMailData({ to: messageReceiver.email, subject, html });
        console.log({ mailData });
        await transporter.sendMail(mailData, async function (err, info) {
          if (err) {
            return next(ApiError.internal(`Error with sending new order message letter, ${err}`));
          } else {
            console.log(`sendMail-${info}`);
          }
        });
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
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new OrderMessageController();
