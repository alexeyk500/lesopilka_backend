const Router = require('express');
const productRouter = new Router();
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const productController = require('../controllers/productController');

productRouter.post('/product', checkRoleMiddleware('ADMIN'), productController.createProduct);
productRouter.post('/description', checkRoleMiddleware('ADMIN'), productController.createDescription);
productRouter.post('/review', checkRoleMiddleware('ADMIN'), productController.createReview);
productRouter.post('/material', checkRoleMiddleware('ADMIN'), productController.createProductMaterial);
productRouter.get('/material', checkRoleMiddleware('ADMIN'), productController.getAllProductMaterials);
productRouter.get('/product/:productId', productController.getProduct);
productRouter.delete('/product', checkRoleMiddleware('ADMIN'), productController.deleteProduct);
productRouter.put('/description', checkRoleMiddleware('ADMIN'), productController.updateDescription);
productRouter.put('/review', checkRoleMiddleware('ADMIN'), productController.updateReview);
productRouter.put('/septic', checkRoleMiddleware('ADMIN'), productController.updateSeptic);

module.exports = productRouter;
