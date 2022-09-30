const productController = require('../controllers/productController');
const { ProductMaterial } = require('../models/productModels');

const res = {
  json: (message) => {
    console.log(`result =${message}`);
  },
};

const materials = [
  { material: 'Ель', isPine: true },
  { material: 'Кедр', isPine: true },
  { material: 'Лиственница', isPine: true },
  { material: 'Пихта', isPine: true },
  { material: 'Сосна', isPine: true },
];

const seedProductMaterial = async () => {
  await ProductMaterial.truncate({ cascade: true, restartIdentity: true });
  for (let material of materials) {
    await productController.createProductMaterial({ body: material }, res, () => {});
    console.log(`Создано ${material}`);
  }
};

module.exports = seedProductMaterial;
