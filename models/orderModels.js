const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { Location } = require('../models/addressModels');
const { User } = require('./userModels');
const { Product } = require('./productModels');

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
    orderDate: { type: DataTypes.DATE },
    deliveryDate: { type: DataTypes.DATE },
    status: {
      type: DataTypes.ENUM('onConfirming', 'confirmedOrder', 'canceledByUser', 'canceledByManufacturer'),
      defaultValue: 'onConfirming',
    },
    contactPersonName: { type: DataTypes.STRING },
    contactPersonPhone: { type: DataTypes.STRING },
    deliveryAddress: { type: DataTypes.STRING },
    deliveryPrice: { type: DataTypes.FLOAT },
    manufacturerConfirmedDate: { type: DataTypes.DATE },
    deleteByUser: { type: DataTypes.BOOLEAN, defaultValue: false },
    deleteByManufacturer: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: false }
);

const OrderProduct = sequelize.define(
  'order_product',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    amount: { type: DataTypes.INTEGER, defaultValue: 1 },
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

Order.hasMany(OrderProduct);
OrderProduct.belongsTo(Order);

Product.hasOne(OrderProduct);
OrderProduct.belongsTo(Product);

module.exports = {
  PaymentMethod,
  DeliveryMethod,
  Order,
  OrderProduct,
};
