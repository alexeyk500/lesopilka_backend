const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { User } = require('./userModels');
const { Manufacturer } = require('./manufacturerModels');
const { Order } = require('./orderModels');

const OrderMessage = sequelize.define(
  'order_message',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    messageDate: { type: DataTypes.DATE },
    messageText: { type: DataTypes.STRING },
  },
  { timestamps: false }
);

User.hasMany(OrderMessage);
OrderMessage.belongsTo(User);

Manufacturer.hasMany(OrderMessage);
OrderMessage.belongsTo(Manufacturer);

Order.hasMany(OrderMessage);
OrderMessage.belongsTo(Order);

module.exports = { OrderMessage };
