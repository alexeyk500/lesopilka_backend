const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const Region = sequelize.define(
  'region',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { timestamps: false }
);

const City = sequelize.define(
  'city',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { timestamps: false }
);

const Street = sequelize.define(
  'street',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  { timestamps: false }
);

const Address = sequelize.define(
  'address',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    home_number: { type: DataTypes.STRING, allowNull: false },
    apartment_number: { type: DataTypes.STRING },
  },
  { timestamps: false }
);

Region.hasMany(City);
City.belongsTo(Region);

City.hasMany(Street);
Street.belongsTo(City);

Street.hasOne(Address);
Address.belongsTo(Street);

module.exports = {
  Region,
  City,
  Street,
  Address,
};
