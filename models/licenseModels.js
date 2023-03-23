const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { Manufacturer } = require('./manufacturerModels');

const ReceiptTransaction = sequelize.define(
  'receiptTransaction',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    receiptDate: { type: DataTypes.DATE },
    receiptSum: { type: DataTypes.FLOAT },
    licenseAmount: { type: DataTypes.INTEGER },
    licensePrice: { type: DataTypes.FLOAT },
  },
  { timestamps: false }
);

const LicenseAction = sequelize.define(
  'licenseAction',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    actionDate: { type: DataTypes.DATE },
    restLicenseAmount: { type: DataTypes.INTEGER },
    redeemLicenseAmount: { type: DataTypes.INTEGER },
    purchaseLicenseAmount: { type: DataTypes.INTEGER },
    activeProductCardAmount: { type: DataTypes.INTEGER },
    draftProductCardAmount: { type: DataTypes.INTEGER },
  },
  { timestamps: false }
);

const LicensePrice = sequelize.define(
  'licensePrice',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    priceDate: { type: DataTypes.DATE },
    licensePrice: { type: DataTypes.FLOAT },
  },
  { timestamps: false }
);

Manufacturer.hasMany(LicenseAction);
LicenseAction.belongsTo(Manufacturer);

Manufacturer.hasMany(ReceiptTransaction);
ReceiptTransaction.belongsTo(Manufacturer);

ReceiptTransaction.hasOne(LicenseAction);
LicenseAction.belongsTo(ReceiptTransaction);

module.exports = {
  LicensePrice,
  LicenseAction,
  ReceiptTransaction,
};
