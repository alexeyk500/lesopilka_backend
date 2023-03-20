const { Order } = require('../models/orderModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { User } = require('../models/userModels');
const { AMOUNT_OF_DAYS_FOR_ARCHIVED_ORDERS } = require('./constants');
const { normalizeData, dateDayShift } = require('./functions');

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

module.exports = {
  getUserForOrder,
  getManufacturerForOrder,
  isOrderShouldBeInArchive,
};
