const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { Product } = require('./productModels');
const { Category, SubCategory } = require('./categoryModels');

const Picture = sequelize.define(
  'picture',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fileName: { type: DataTypes.STRING },
  },
  { timestamps: false }
);

Product.hasMany(Picture);
Picture.belongsTo(Product);

Category.hasMany(Picture);
Picture.belongsTo(Category);

SubCategory.hasMany(Picture);
Picture.belongsTo(SubCategory);

module.exports = {
  Picture,
};
