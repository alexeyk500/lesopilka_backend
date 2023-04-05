const sequelize = require("../db");
const { DataTypes } = require("sequelize");
const { User } = require("./userModels");
const { Address } = require("./addressModels");

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

module.exports = {
  Reseller,
};
