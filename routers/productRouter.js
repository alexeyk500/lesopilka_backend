const Router = require('express');
const productRouter = new Router();
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const productController = require('../controllers/productController');

productRouter.post('/', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), productController.createProduct);
productRouter.put('/', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), productController.updateProduct);
productRouter.delete('/', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), productController.deleteProduct);
productRouter.get('/products', productController.getProducts);
productRouter.post('/description', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), productController.createDescription);
productRouter.put('/description', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), productController.updateDescription);
productRouter.post(
  '/material',
  checkRoleMiddleware(['ADMIN', 'MANUFACTURER']),
  productController.createProductMaterial
);
productRouter.get('/materials', productController.getAllProductMaterials);
productRouter.post('/sort', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), productController.createProductSort);
productRouter.get('/sorts', productController.getAllProductSorts);
productRouter.get('/:id', productController.getProduct);
// productRouter.put('/review', checkRoleMiddleware('ADMIN'), productController.updateReview);
// productRouter.post('/review', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), productController.createReview);

module.exports = productRouter;
