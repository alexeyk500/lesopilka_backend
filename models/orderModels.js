const sequelize = require('../db');
const { DataTypes } = require('sequelize');

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

// const Order = sequelize.define(
//   'order',
//   {
//     id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     date: { type: DataTypes.DATE },
//     contactPersonName: { type: DataTypes.STRING },
//     contactPersonPhone: { type: DataTypes.STRING },
//   },
//   { timestamps: false }
// );

module.exports = {
  PaymentMethod,
  DeliveryMethod,
};
