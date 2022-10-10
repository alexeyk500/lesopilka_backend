const productController = require('../controllers/productController');
const { ProductSort } = require('../models/productModels');

const res = {
  json: (message) => {
    console.log(`result =${message}`);
  },
};

const sorts = [{ title: 'Экстра' }, { title: '1-й' }, { title: '2-й' }, { title: '3-й' }, { title: '4-й' }];

const seedProductSorts = async () => {
  await ProductSort.truncate({ cascade: true, restartIdentity: true });
  for (let sort of sorts) {
    await productController.createProductSort({ body: sort }, res, () => {});
    console.log(`Создано ${sort.title}`);
  }
};

module.exports = seedProductSorts;
