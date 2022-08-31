const Router = require('express');
const productRouter = new Router();
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const productController = require('../controllers/productController');

productRouter.post('/product', checkRoleMiddleware('ADMIN'), productController.createProduct);
module.exports = productRouter;
