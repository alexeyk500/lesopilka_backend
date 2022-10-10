const Router = require('express');
const categoryRouter = new Router();
const categoryController = require('../controllers/categoryController');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');

categoryRouter.post('/category', checkRoleMiddleware('ADMIN'), categoryController.createCategory);
categoryRouter.post('/sub_category', checkRoleMiddleware('ADMIN'), categoryController.createSubCategory);
categoryRouter.post('/size', checkRoleMiddleware('ADMIN'), categoryController.createCategorySize);
categoryRouter.get('/categories', categoryController.getAllCategories);
categoryRouter.get('/sub_categories', categoryController.getAllSubCategories);
categoryRouter.get('/sizes', categoryController.getAllCategorySizes);
module.exports = categoryRouter;
