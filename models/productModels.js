const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { SubCategory, CategorySize } = require('./categoryModels');
const { Picture } = require('./pictureModels');
const { Manufacturer } = require('./manufacturerModels');

const Product = sequelize.define(
  'product',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    isSeptic: { type: DataTypes.BOOLEAN, defaultValue: false },
    editionDate: { type: DataTypes.DATE },
    publicationDate: { type: DataTypes.DATE },
  },
  { timestamps: false }
);

const ProductSort = sequelize.define(
  'productSort',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.TEXT, unique: true, allowNull: false },
  },
  { timestamps: false }
);

const ProductMaterial = sequelize.define(
  'productMaterial',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.TEXT, unique: true, allowNull: false },
    isPine: { type: DataTypes.BOOLEAN, defaultValue: false },
    order: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  },
  { timestamps: false }
);

const ProductDescription = sequelize.define(
  'productDescription',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    description: { type: DataTypes.TEXT, allowNull: false },
  },
  { timestamps: false }
);

const CategorySize_Product = sequelize.define(
  'CategorySize_Product',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  },
  { timestamps: false }
);

Manufacturer.hasMany(Product);
Product.belongsTo(Manufacturer);

SubCategory.hasMany(Product);
Product.belongsTo(SubCategory);

ProductMaterial.hasMany(Product);
Product.belongsTo(ProductMaterial);

ProductSort.hasMany(Product);
Product.belongsTo(ProductSort);

Product.hasOne(ProductDescription);
ProductDescription.belongsTo(Product);

CategorySize.belongsToMany(Product, { through: CategorySize_Product });
Product.belongsToMany(CategorySize, { through: CategorySize_Product });

module.exports = {
  Product,
  ProductDescription,
  CategorySize_Product,
  ProductMaterial,
  ProductSort,
};
