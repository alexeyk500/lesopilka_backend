const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { SizeTypeEnum } = require('../utils/constants');
const { Order } = require('./orderModels');
const { SubCategory } = require('./categoryModels');
const { ProductMaterial, ProductSort, Product } = require('./productModels');

const ConfirmedProduct = sequelize.define(
  'confirmedProduct',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING },
    [SizeTypeEnum.height]: { type: DataTypes.FLOAT },
    [SizeTypeEnum.width]: { type: DataTypes.FLOAT },
    [SizeTypeEnum.length]: { type: DataTypes.FLOAT },
    [[SizeTypeEnum.caliber]]: { type: DataTypes.FLOAT },
    isSeptic: { type: DataTypes.BOOLEAN, defaultValue: false },
    isDried: { type: DataTypes.BOOLEAN, defaultValue: false },
    amount: { type: DataTypes.INTEGER },
    price: { type: DataTypes.FLOAT },
    image: { type: DataTypes.STRING },
  },
  { timestamps: false }
);

Order.hasMany(ConfirmedProduct);
ConfirmedProduct.belongsTo(Order);

Product.hasOne(ConfirmedProduct);
ConfirmedProduct.belongsTo(Product);

SubCategory.hasMany(ConfirmedProduct);
ConfirmedProduct.belongsTo(SubCategory);

ProductMaterial.hasMany(ConfirmedProduct);
ConfirmedProduct.belongsTo(ProductMaterial);

ProductSort.hasMany(ConfirmedProduct);
ConfirmedProduct.belongsTo(ProductSort);

module.exports = {
  ConfirmedProduct,
};
