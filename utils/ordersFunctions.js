const { Order } = require('../models/orderModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { User } = require('../models/userModels');
const { AMOUNT_OF_DAYS_FOR_ARCHIVED_ORDERS, MessageFromToOptions } = require('./constants');
const { normalizeData, dateDayShift } = require('./functions');
const { makeMailData, transporter } = require('../nodemailer/nodemailer');
const ApiError = require('../error/apiError');
const { getOrderMessageHTML } = require('../nodemailer/getOrderMessageHTML');
const { OrderMessage } = require("../models/orderMessageModels");

const isOrderShouldBeInArchive = (orderDeliveryDate) => {
  const nowDate = normalizeData(new Date());
  const shiftedOrderDate = dateDayShift(orderDeliveryDate, AMOUNT_OF_DAYS_FOR_ARCHIVED_ORDERS);
  return nowDate > shiftedOrderDate;
};

const getUserForOrder = async (orderId) => {
  const order = await Order.findOne({
    where: { id: orderId },
  });
  if (order.userId) {
    const user = await User.findOne({
      where: { id: order.userId },
    });
    if (user) {
      return user;
    }
  }
  return undefined;
};

const getManufacturerForOrder = async (orderId) => {
  const order = await Order.findOne({
    where: { id: orderId },
  });
  if (order.manufacturerId) {
    const manufacturer = await Manufacturer.findOne({
      where: { id: order.manufacturerId },
    });
    if (manufacturer) {
      return manufacturer;
    }
  }
  return undefined;
};

const sendNewMessageForOrder = async ({ orderId, messageFromTo, messageText, next }) => {
  let messageReceiver;
  if (messageFromTo === MessageFromToOptions.ManufacturerToUser || messageFromTo === MessageFromToOptions.RobotToUser) {
    messageReceiver = await getUserForOrder(orderId);
  } else if (
    messageFromTo === MessageFromToOptions.UserToManufacturer ||
    messageFromTo === MessageFromToOptions.RobotToManufacturer
  ) {
    messageReceiver = await getManufacturerForOrder(orderId);
  } else {
    return next(ApiError.internal(`Error with message receiver`));
  }

  if (messageReceiver.email && messageText) {
    const subject = `Сообщение по заказу № ${orderId} от ${process.env.SITE_NAME}`;
    const html = getOrderMessageHTML(orderId, messageFromTo, messageText);
    if (html) {
      const mailData = makeMailData({ to: messageReceiver.email, subject, html });
      await transporter.sendMail(mailData, async function (err, info) {
        if (err) {
          return next(ApiError.internal(`Error with sending new order message letter, ${err}`));
        } else {
          console.log(`sendMail-${info}`);
        }
      });
    }
  }
};

const createOrderMessage = async ({ orderId, userId, manufacturerId, messageDate, messageText, next }) => {
  const newOrderMessage = await OrderMessage.create({ messageDate, userId, manufacturerId, orderId, messageText });
  if (!newOrderMessage) {
    return next(ApiError.badRequest(`createNewOrderMessage - request denied 15`));
  }
  return newOrderMessage
}

module.exports = {
  getUserForOrder,
  getManufacturerForOrder,
  isOrderShouldBeInArchive,
  sendNewMessageForOrder,
  createOrderMessage
};
