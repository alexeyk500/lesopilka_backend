const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: 'USER' },
});

const Region = sequelize.define('region', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
  code: { type: DataTypes.INTEGER, unique: true, allowNull: false },
});

const City = sequelize.define('city', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
  code: { type: DataTypes.INTEGER, unique: true, allowNull: false },
});

const Street = sequelize.define('street', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
});

const Address = sequelize.define('address', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  home_number: { type: DataTypes.STRING, unique: true, allowNull: false },
  apartment_number: { type: DataTypes.STRING, unique: true, allowNull: false },
});

Region.hasMany(City);
City.belongsTo(Region);

City.hasMany(Street);
Street.belongsTo(City);

Street.hasOne(Address);
Address.belongsTo(Street);

User.hasMany(Address);
Address.belongsTo(User);

module.exports = {
  Region,
  City,
  Street,
  Address,
  User
}
