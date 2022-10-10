const productController = require('../controllers/productController');
const { ProductSort } = require('../models/productModels');

const res = {
  json: (message) => {
    console.log(`result =${message}`);
  },
};

const sorts = [
  { title: 'Экстра сорт' },
  { title: '1-й сорт' },
  { title: '1-й и 2-й сорт' },
  { title: '2-й сорт' },
  { title: '2-й и 3-й сорт' },
  { title: '3-й сорт' },
  { title: '3-й и 4-й сорт' },
  { title: '4-й сорт' },
];

const seedProductSorts = async () => {
  await ProductSort.truncate({ cascade: true, restartIdentity: true });
  for (let sort of sorts) {
    await productController.createProductSort({ body: sort }, res, () => {});
    console.log(`Создано ${sort.title}`);
  }
};

module.exports = seedProductSorts;
