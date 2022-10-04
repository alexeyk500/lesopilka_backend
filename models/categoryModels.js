const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const Category = sequelize.define(
  'category',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true, allowNull: false },
    order: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  },
  { timestamps: false }
);

const SubCategory = sequelize.define(
  'subCategory',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true, allowNull: false },
    order: { type: DataTypes.INTEGER },
  },
  { timestamps: false }
);

const CategorySort = sequelize.define(
  'categorySort',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true, allowNull: false },
    order: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  },
  { timestamps: false }
);

const CategorySize = sequelize.define(
  'categorySize',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.INTEGER, allowNull: false },
    isCustomSize: { type: DataTypes.BOOLEAN, defaultValue: false},
    order: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  },
  { timestamps: false }
);

Category.hasMany(SubCategory);
SubCategory.belongsTo(Category);

Category.hasMany(CategorySort);
CategorySort.belongsTo(Category);

Category.hasMany(CategorySize);
CategorySize.belongsTo(Category);

module.exports = {
  Category,
  SubCategory,
  CategorySort,
  CategorySize,
};
