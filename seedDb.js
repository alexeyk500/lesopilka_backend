require('dotenv').config();
const sequelize = require('./db');
const seedCategory = require('./seedsForDB/seedCategory');
const seedSubCategories = require('./seedsForDB/seedSubCategories');
const seedPictures = require('./seedsForDB/seedPictures');
const seedProductMaterials = require('./seedsForDB/seedProductMaterials');
const seedCategorySizes = require('./seedsForDB/seedCategorySizes');
const seedProductSorts = require('./seedsForDB/seedProductSorts');

const seedDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Начал заполнение БД');
    // await seedCategory();
    // await seedSubCategories();
    // await seedPictures();
    // await seedProductMaterials();
    // await seedCategorySizes();
    // await seedProductSorts();
    console.log('Окончил заполнение БД');
  } catch (e) {
    console.log(e);
  } finally {
    await sequelize.close();
  }
};

seedDB().then();
