const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { Address } = require('./addressModels');
const { ProductReview } = require('./productModels');
const { Basket } = require('./basketModels');

const User = sequelize.define(
  'user',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: 'USER' },
    manufacturerTitle: { type: DataTypes.STRING },
    manufacturerInn: { type: DataTypes.STRING, unique: true },
    manufacturerLocationId: { type: DataTypes.STRING },
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

User.hasMany(Address);
Address.belongsTo(User);

User.hasMany(ProductReview);
ProductReview.belongsTo(User);

User.hasMany(Basket);
Basket.belongsTo(User);

module.exports = {
  User,
  UnconfirmedUser,
  PasswordRecoveryCode,
};
