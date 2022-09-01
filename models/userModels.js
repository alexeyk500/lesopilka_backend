const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { Address } = require('./addressModels');
const { ProductReview } = require('./productModels');

const User = sequelize.define(
  'user',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: 'USER' },
  },
  { timestamps: false }
);

User.hasMany(Address);
Address.belongsTo(User);

User.hasMany(ProductReview);
ProductReview.belongsTo(User);

module.exports = {
  User,
};
