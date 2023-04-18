const Router = require('express');
const productRouter = new Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

productRouter.post('/', authMiddleware, productController.createProduct);
productRouter.put('/', authMiddleware, productController.updateProduct);
productRouter.delete('/', authMiddleware, productController.deleteProduct);
productRouter.get('/products', productController.getProducts);
productRouter.post('/description', authMiddleware, productController.createDescription);
productRouter.put('/description', authMiddleware, productController.updateDescription);
productRouter.post('/material', authMiddleware, productController.createProductMaterial);
productRouter.get('/materials', productController.getAllProductMaterials);
productRouter.post('/sort', authMiddleware, productController.createProductSort);
productRouter.get('/sorts', productController.getAllProductSorts);
productRouter.post('/product-publication', authMiddleware, productController.productPublication);
productRouter.post('/product-stop-publication', authMiddleware, productController.productStopPublication);

productRouter.get('/:id', productController.getProduct);

module.exports = productRouter;
