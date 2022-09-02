const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { Product } = require('./productModels');
const { Category, SubCategory } = require('./categoryModels');

const Picture = sequelize.define(
  'picture',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    file_name: { type: DataTypes.STRING, unique: true },
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
