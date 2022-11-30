const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { SubCategory } = require('./categoryModels');
const { Manufacturer } = require('./manufacturerModels');
const { SizeTypeEnum } = require('../utils/constants');

const Product = sequelize.define(
  'product',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING },
    price: { type: DataTypes.FLOAT },
    [SizeTypeEnum.height]: { type: DataTypes.FLOAT },
    [SizeTypeEnum.width]: { type: DataTypes.FLOAT },
    [SizeTypeEnum.length]: { type: DataTypes.FLOAT },
    [[SizeTypeEnum.caliber]]: { type: DataTypes.FLOAT },
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
    description: { type: DataTypes.TEXT },
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

module.exports = {
  Product,
  ProductDescription,
  // CategorySize_Product,
  ProductMaterial,
  ProductSort,
};
