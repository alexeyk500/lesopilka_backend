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

const Location = sequelize.define(
  'location',
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
    street: { type: DataTypes.STRING },
    building: { type: DataTypes.STRING },
    office: { type: DataTypes.STRING },
    postIndex: { type: DataTypes.STRING },
  },
  { timestamps: false }
);

const PickUpAddress = sequelize.define(
  'pickUpAddress',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    street: { type: DataTypes.STRING },
    building: { type: DataTypes.STRING },
    office: { type: DataTypes.STRING },
    postIndex: { type: DataTypes.STRING },
  },
  { timestamps: false }
);

Region.hasMany(Location);
Location.belongsTo(Region);

Location.hasMany(Address);
Address.belongsTo(Location);

Location.hasMany(PickUpAddress);
PickUpAddress.belongsTo(Location);

module.exports = {
  Region,
  Location,
  Address,
  PickUpAddress,
};
