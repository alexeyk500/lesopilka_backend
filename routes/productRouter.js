const Router = require('express');
const productRouter = new Router();
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const productController = require('../controllers/productController');

productRouter.post('/', checkRoleMiddleware('ADMIN'), productController.createProduct);
productRouter.post('/description', checkRoleMiddleware('ADMIN'), productController.createDescription);
productRouter.post('/review', checkRoleMiddleware('ADMIN'), productController.createReview);
productRouter.post('/material', checkRoleMiddleware('ADMIN'), productController.createProductMaterial);
productRouter.post('/sort', checkRoleMiddleware('ADMIN'), productController.createProductSort);
productRouter.delete('/product', checkRoleMiddleware('ADMIN'), productController.deleteProduct);
productRouter.put('/description', checkRoleMiddleware('ADMIN'), productController.updateDescription);
productRouter.put('/review', checkRoleMiddleware('ADMIN'), productController.updateReview);
productRouter.put('/septic', checkRoleMiddleware('ADMIN'), productController.updateSeptic);
productRouter.get('/sorts', productController.getAllProductSorts);
productRouter.get('/materials', productController.getAllProductMaterials);
productRouter.get('/:id', productController.getProduct);

module.exports = productRouter;
