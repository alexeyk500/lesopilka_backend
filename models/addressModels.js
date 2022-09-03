const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const Region = sequelize.define(
  'region',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { timestamps: false }
);

const City = sequelize.define(
  'city',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { timestamps: false }
);

const Address = sequelize.define(
  'address',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    apartment: { type: DataTypes.STRING },
    house: { type: DataTypes.STRING, allowNull: false },
    street: { type: DataTypes.STRING, allowNull: false },
  },
  { timestamps: false }
);

Region.hasMany(City);
City.belongsTo(Region);

City.hasMany(Address);
Address.belongsTo(City);

module.exports = {
  Region,
  City,
  Address,
};
