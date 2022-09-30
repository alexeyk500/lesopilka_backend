require('dotenv').config();
const sequelize = require('./db');
const seedCategory = require('./seedsForDB/seedCategory');
const seedSubCategories = require('./seedsForDB/seedSubCategories');
const seedPictures = require('./seedsForDB/seedPictures');
const seedProductMaterial = require('./seedsForDB/seedProductMaterials');

const seedDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Начал заполнение БД');
    await seedCategory();
    await seedSubCategories();
    await seedPictures();
    await seedProductMaterial();
    console.log('Окончил заполнение БД');
  } catch (e) {
    console.log(e);
  } finally {
    await sequelize.close();
  }
};

seedDB().then();
