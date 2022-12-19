const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { Address, Region, Location } = require('./addressModels');

const User = sequelize.define(
  'user',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: 'USER' },
    password: { type: DataTypes.STRING },
  },
  { timestamps: false }
);

const UnconfirmedUser = sequelize.define(
  'unconfirmedUser',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    code: { type: DataTypes.STRING },
    time: { type: DataTypes.DATE },
  },
  { timestamps: false }
);

const PasswordRecoveryCode = sequelize.define(
  'passwordRecoveryCode',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    code: { type: DataTypes.STRING },
    time: { type: DataTypes.DATE },
  },
  { timestamps: false }
);

Address.hasOne(User);
User.belongsTo(Address);

const SearchRegionAndLocation = sequelize.define('searchRegionAndLocation', {}, { timestamps: false });
User.hasOne(SearchRegionAndLocation);
SearchRegionAndLocation.belongsTo(User);
SearchRegionAndLocation.belongsTo(Region);
SearchRegionAndLocation.belongsTo(Location);

module.exports = {
  User,
  UnconfirmedUser,
  PasswordRecoveryCode,
  SearchRegionAndLocation,
};
