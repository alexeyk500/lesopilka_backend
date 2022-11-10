const { CategorySize } = require('../models/categoryModels');
const categoryController = require('../controllers/categoryController');

const res = {
  json: (message) => {
    console.log(`result =${message}`);
  },
};

const categoryBrus = [
  {
    type: 'length',
    value: 3000,
    categoryId: 1,
  },
  {
    type: 'length',
    value: 4000,
    categoryId: 1,
  },
  {
    type: 'length',
    value: 6000,
    categoryId: 1,
  },
  {
    type: 'height',
    value: 100,
    categoryId: 1,
  },
  {
    type: 'height',
    value: 120,
    categoryId: 1,
  },
  {
    type: 'height',
    value: 150,
    categoryId: 1,
  },
  {
    type: 'height',
    value: 180,
    categoryId: 1,
  },
  {
    type: 'height',
    value: 200,
    categoryId: 1,
  },
  {
    type: 'height',
    value: 220,
    categoryId: 1,
  },
  {
    type: 'width',
    value: 100,
    categoryId: 1,
  },
  {
    type: 'width',
    value: 120,
    categoryId: 1,
  },
  {
    type: 'width',
    value: 150,
    categoryId: 1,
  },
  {
    type: 'width',
    value: 180,
    categoryId: 1,
  },
  {
    type: 'width',
    value: 200,
    categoryId: 1,
  },
  {
    type: 'width',
    value: 220,
    categoryId: 1,
  },
];
const categoryDoska = [
  {
    type: 'length',
    value: 3000,
    categoryId: 2,
  },
  {
    type: 'length',
    value: 4000,
    categoryId: 2,
  },
  {
    type: 'length',
    value: 6000,
    categoryId: 2,
  },
  {
    type: 'height',
    value: 20,
    categoryId: 2,
  },
  {
    type: 'height',
    value: 25,
    categoryId: 2,
  },
  {
    type: 'height',
    value: 30,
    categoryId: 2,
  },
  {
    type: 'height',
    value: 32,
    categoryId: 2,
  },
  {
    type: 'height',
    value: 40,
    categoryId: 2,
  },
  {
    type: 'height',
    value: 50,
    categoryId: 2,
  },
  {
    type: 'width',
    value: 100,
    categoryId: 2,
  },
  {
    type: 'width',
    value: 120,
    categoryId: 2,
  },
  {
    type: 'width',
    value: 150,
    categoryId: 2,
  },
  {
    type: 'width',
    value: 180,
    categoryId: 2,
  },
  {
    type: 'width',
    value: 200,
    categoryId: 2,
  },
];

const categoryBrevno = [
  {
    type: 'length',
    value: 3000,
    categoryId: 6,
  },
  {
    type: 'length',
    value: 4000,
    categoryId: 6,
  },
  {
    type: 'length',
    value: 5000,
    categoryId: 6,
  },
  {
    type: 'length',
    value: 6000,
    categoryId: 6,
  },
  {
    type: 'caliber',
    value: 100,
    categoryId: 6,
  },
  {
    type: 'caliber',
    value: 150,
    categoryId: 6,
  },
  {
    type: 'caliber',
    value: 180,
    categoryId: 6,
  },
  {
    type: 'caliber',
    value: 200,
    categoryId: 6,
  },
  {
    type: 'caliber',
    value: 220,
    categoryId: 6,
  },
  {
    type: 'caliber',
    value: 280,
    categoryId: 6,
  },
  {
    type: 'caliber',
    value: 300,
    categoryId: 6,
  },
  {
    type: 'caliber',
    value: 400,
    categoryId: 6,
  },
  {
    type: 'caliber',
    value: 500,
    categoryId: 6,
  },
];

const categorySizes = [...categoryBrus, ...categoryDoska, ...categoryBrevno];

const seedCategorySizes = async () => {
  await CategorySize.truncate({ cascade: true, restartIdentity: true });
  for (let categorySize of categorySizes) {
    await categoryController.createCategorySize({ body: categorySize }, res, () => {});
    console.log(
      `Создан CategorySize = id:${categorySize.categoryId}, type:${categorySize.type}, value:${categorySize.value}`
    );
  }
};

module.exports = seedCategorySizes;
