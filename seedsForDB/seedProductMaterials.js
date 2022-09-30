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
  { material: 'Береза', isPine: false },
  { material: 'Бук', isPine: false },
  { material: 'Дуб', isPine: false },
  { material: 'Клен', isPine: false },
  { material: 'Липа', isPine: false },
  { material: 'Ольха', isPine: false },
  { material: 'Орех', isPine: false },
  { material: 'Осина', isPine: false },
  { material: 'Ясень', isPine: false },
];

const seedProductMaterial = async () => {
  await ProductMaterial.truncate({ cascade: true, restartIdentity: true });
  for (let material of materials) {
    await productController.createProductMaterial({ body: material }, res, () => {});
    console.log(`Создано ${material}`);
  }
};

module.exports = seedProductMaterial;
