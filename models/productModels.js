const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { SubCategory, CategorySize } = require('./categoryModels');

const Product = sequelize.define(
  'product',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false },
    edition_date: { type: DataTypes.DATE },
    publication_date: { type: DataTypes.DATE },
  },
  { timestamps: false }
);

const CategorySize_Product = sequelize.define('CategorySize_Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
}, { timestamps: false }
);

SubCategory.hasMany(Product);
Product.belongsTo(SubCategory);

CategorySize.belongsToMany(Product, { through: CategorySize_Product });
Product.belongsToMany(CategorySize, { through: CategorySize_Product });

module.exports = {
  Product,
};
