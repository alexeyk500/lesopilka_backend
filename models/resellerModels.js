const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { User } = require('./userModels');
const { Address } = require('./addressModels');
const { Manufacturer } = require('./manufacturerModels');

const Reseller = sequelize.define(
  'reseller',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    phone: { type: DataTypes.STRING, unique: true },
    family: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    middleName: { type: DataTypes.STRING },
  },
  { timestamps: false }
);

User.hasOne(Reseller);
Reseller.belongsTo(User);

Address.hasOne(Reseller);
Reseller.belongsTo(Address);

const ResellerManufacturer = sequelize.define(
  'reseller_manufacturer',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  },
  { timestamps: false }
);

Reseller.hasMany(ResellerManufacturer);
ResellerManufacturer.belongsTo(Reseller);

Manufacturer.hasOne(ResellerManufacturer);
ResellerManufacturer.belongsTo(Manufacturer);

const ResellerManufacturerCandidate = sequelize.define(
  'resellerManufacturerCandidate',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    inn: { type: DataTypes.STRING, unique: true },
    phone: { type: DataTypes.STRING, unique: true },
    email: { type: DataTypes.STRING, unique: true },
    locationId: { type: DataTypes.INTEGER },
    street: { type: DataTypes.STRING },
    building: { type: DataTypes.STRING },
    office: { type: DataTypes.STRING },
    postIndex: { type: DataTypes.STRING },
    resellerId: { type: DataTypes.INTEGER },
    code: { type: DataTypes.STRING },
    isActivated: { type: DataTypes.BOOLEAN, defaultValue: false },
    time: { type: DataTypes.DATE },
  },
  { timestamps: false }
);

module.exports = {
  Reseller,
  ResellerManufacturer,
  ResellerManufacturerCandidate,
};
