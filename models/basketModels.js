const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { Product } = require('./productModels');
const { User } = require('./userModels');

const Basket = sequelize.define(
  'basket',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  },
  { timestamps: false }
);

const BasketProduct = sequelize.define(
  'basket_product',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  },
  { timestamps: false }
);

User.hasOne(Basket);
Basket.belongsTo(User);

Basket.hasMany(BasketProduct);
BasketProduct.belongsTo(Basket);

Product.hasOne(BasketProduct);
BasketProduct.belongsTo(Product);

module.exports = {
  Basket,
  BasketProduct,
};
