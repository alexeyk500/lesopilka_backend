const productController = require('../controllers/productController');
const { ProductMaterial } = require('../models/productModels');

const res = {
  json: (message) => {
    console.log(`result =${message}`);
  },
};

const materials = [
  { title: 'Ель', isPine: true },
  { title: 'Кедр', isPine: true },
  { title: 'Лиственница', isPine: true },
  { title: 'Пихта', isPine: true },
  { title: 'Сосна', isPine: true },
  { title: 'Береза', isPine: false },
  { title: 'Бук', isPine: false },
  { title: 'Дуб', isPine: false },
  { title: 'Клен', isPine: false },
  { title: 'Липа', isPine: false },
  { title: 'Ольха', isPine: false },
  { title: 'Орех', isPine: false },
  { title: 'Осина', isPine: false },
  { title: 'Ясень', isPine: false },
];

// const materials = [
//   { material: 'Береза', isPine: false },
//   { material: 'Бук', isPine: false },
//   { material: 'Дуб', isPine: false },
//   { material: 'Ель', isPine: false },
//   { material: 'Кедр', isPine: false },
//   { material: 'Клен', isPine: false },
//   { material: 'Липа', isPine: false },
//   { material: 'Лиственница', isPine: false },
//   { material: 'Ольха', isPine: false },
//   { material: 'Орех', isPine: false },
//   { material: 'Осина', isPine: false },
//   { material: 'Пихта', isPine: false },
//   { material: 'Сосна', isPine: false },
//   { material: 'Ясень', isPine: false },
// ];

const seedProductMaterial = async () => {
  await ProductMaterial.truncate({ cascade: true, restartIdentity: true });
  for (let material of materials) {
    await productController.createProductMaterial({ body: material }, res, () => {});
    console.log(`Создано ${material}`);
  }
};

module.exports = seedProductMaterial;
