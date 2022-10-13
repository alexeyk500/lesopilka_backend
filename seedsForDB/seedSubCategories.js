const { SubCategory } = require('../models/categoryModels');
const categoryController = require('../controllers/categoryController');

const res = {
  json: (message) => {
    console.log(`result =${message}`);
  },
};

const subCategories = [
  { categoryId: '1', title: 'Брус' },
  { categoryId: '1', title: 'Калиброваннный Брус' },
  { categoryId: '1', title: 'Профилированный Брус' },
  { categoryId: '1', title: 'Оцилиндрованный Брус' },
  { categoryId: '1', title: 'Строганный Брус' },
  { categoryId: '1', title: 'Клееный Брус' },
  { categoryId: '1', title: 'Имитация Бруса' },

  { categoryId: '2', title: 'Доска' },
  { categoryId: '2', title: 'Обрезная Доска' },
  { categoryId: '2', title: 'Половая Доска' },
  { categoryId: '2', title: 'Террасная Доска' },
  { categoryId: '2', title: 'Необрезанная Доска' },
  { categoryId: '2', title: 'Шпунтованная Доска' },

  { categoryId: '3', title: 'Вагонка' },
  { categoryId: '3', title: 'Штиль Вагонка' },
  { categoryId: '3', title: 'Евро Вагонка' },
  { categoryId: '3', title: 'Планкен' },

  { categoryId: '4', title: 'Наличник' },
  { categoryId: '4', title: 'Плинтус' },
  { categoryId: '4', title: 'Галтель' },
  { categoryId: '4', title: 'Рейка' },
  { categoryId: '4', title: 'Брусок' },

  { categoryId: '5', title: 'Блокхаус' },
  { categoryId: '5', title: 'Лендхаус' },

  { categoryId: '6', title: 'Бревно' },
  { categoryId: '6', title: 'Окоренное Бревно' },
  { categoryId: '6', title: 'Оцилиндрованное Бревно' },
  { categoryId: '6', title: 'Калиброванное Бревно' },
  { categoryId: '6', title: 'Строганное Бревно' },
  { categoryId: '6', title: 'Имитация Бревна' },

  { categoryId: '7', title: 'Опилки' },
  { categoryId: '7', title: 'Топливные Пеллеты' },
];

const seedSubCategories = async () => {
  await SubCategory.truncate({ cascade: true, restartIdentity: true });
  for (let subCategory of subCategories) {
    await categoryController.createSubCategory({ body: subCategory }, res, () => {});
    console.log(`Создано ${subCategory}`);
  }
};

module.exports = seedSubCategories;
