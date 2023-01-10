const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { Location } = require('../models/addressModels');
const { User } = require('./userModels');

const PaymentMethod = sequelize.define(
  'paymentMethod',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
  },
  { timestamps: false }
);

const DeliveryMethod = sequelize.define(
  'deliveryMethod',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
  },
  { timestamps: false }
);

const Order = sequelize.define(
  'order',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATE },
    status: { type: DataTypes.STRING },
    contactPersonName: { type: DataTypes.STRING },
    contactPersonPhone: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
  },
  { timestamps: false }
);

Location.hasMany(Order);
Order.belongsTo(Location);

User.hasMany(Order);
Order.belongsTo(User);

PaymentMethod.hasMany(Order);
Order.belongsTo(PaymentMethod);

DeliveryMethod.hasMany(Order);
Order.belongsTo(DeliveryMethod);

module.exports = {
  PaymentMethod,
  DeliveryMethod,
};
