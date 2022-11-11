const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { Product } = require('./productModels');
const { Category } = require('./categoryModels');

const Picture = sequelize.define(
  'picture',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fileName: { type: DataTypes.STRING },
    order: { type: DataTypes.INTEGER },
  },
  { timestamps: false }
);

Product.hasMany(Picture);
Picture.belongsTo(Product);

Category.hasMany(Picture);
Picture.belongsTo(Category);

module.exports = {
  Picture,
};
