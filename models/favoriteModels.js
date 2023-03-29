const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { User } = require('./userModels');
const { Product } = require('./productModels');

const FavoriteProduct = sequelize.define(
  'favoriteProduct',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  },
  { timestamps: false }
);

Product.hasMany(FavoriteProduct);
FavoriteProduct.belongsTo(Product);

User.hasMany(FavoriteProduct);
FavoriteProduct.belongsTo(User);

module.exports = {
  FavoriteProduct,
};
