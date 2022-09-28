require('dotenv').config();
const sequelize = require('./db');
const seedCategory = require('./seedsForDB/seedCategory');

const seedDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Начал заполнение БД');
    await seedCategory();
    console.log('Окончил заполнение БД');
  } catch (e) {
    console.log(e);
  } finally {
    await sequelize.close();
  }
};

seedDB().then();
