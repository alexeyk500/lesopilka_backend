const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { Address } = require('./addressModels');
const { User } = require('./userModels');

const Manufacturer = sequelize.define(
  'manufacturer',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    inn: { type: DataTypes.STRING, unique: true },
    title: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    approved: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: false }
);

Address.hasOne(Manufacturer);
Manufacturer.belongsTo(Address);

User.hasOne(Manufacturer);
Manufacturer.belongsTo(User);

module.exports = {
  Manufacturer,
};
