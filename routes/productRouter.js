const Router = require('express');
const productRouter = new Router();
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const productController = require('../controllers/productController');

productRouter.post('/product', checkRoleMiddleware('ADMIN'), productController.createProduct);
productRouter.post('/description', checkRoleMiddleware('ADMIN'), productController.createDescription);
productRouter.post('/review', checkRoleMiddleware('ADMIN'), productController.createReview);
productRouter.get('/product/:productId', productController.getProduct);
productRouter.delete('/product', checkRoleMiddleware('ADMIN'), productController.deleteProduct);
module.exports = productRouter;
