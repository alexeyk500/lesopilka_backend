const Router = require('express');
const productRouter = new Router();
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const productController = require('../controllers/productController');

productRouter.post('/', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), productController.createProduct);
productRouter.put('/', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), productController.updateProduct);
productRouter.delete('/', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), productController.deleteProduct);
productRouter.post('/description', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), productController.createDescription);
productRouter.post(
  '/material',
  checkRoleMiddleware(['ADMIN', 'MANUFACTURER']),
  productController.createProductMaterial
);
productRouter.post('/sort', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), productController.createProductSort);
productRouter.put('/description', checkRoleMiddleware('ADMIN'), productController.updateDescription);
// productRouter.put('/review', checkRoleMiddleware('ADMIN'), productController.updateReview);
// productRouter.post('/review', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), productController.createReview);
productRouter.get('/products', productController.getProducts);
productRouter.get('/sorts', productController.getAllProductSorts);
productRouter.get('/materials', productController.getAllProductMaterials);
productRouter.get('/:id', productController.getProduct);

module.exports = productRouter;
