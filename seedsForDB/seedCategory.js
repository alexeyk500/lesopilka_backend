const { Category} = require('../models/categoryModels');
const categoryController = require('../controllers/categoryController');

const res = {
  json: (message) => {
    console.log(`result =${message}`);
  },
};

const categories = ['Брус', 'Доска', 'Вагонка', 'Погонаж', 'БлокХаус и Лендхаус', 'Бревно', 'Опилки и Пеллеты'];

const seedCategory = async () => {
  await Category.truncate({cascade: true, restartIdentity:true});
  for (let category of categories) {
    await categoryController.createCategory({ body: { title: category } }, res, () => {});
    console.log(`Создано ${category}`);
  }
};

module.exports = seedCategory;
