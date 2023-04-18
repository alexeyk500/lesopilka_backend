const Router = require('express');
const categoryRouter = new Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

categoryRouter.post('/category', authMiddleware, categoryController.createCategory);
categoryRouter.post('/sub_category', authMiddleware, categoryController.createSubCategory);
categoryRouter.post('/size', authMiddleware, categoryController.createCategorySize);
categoryRouter.get('/categories', categoryController.getAllCategories);
categoryRouter.get('/sub_categories', categoryController.getAllSubCategories);
categoryRouter.get('/sizes', categoryController.getAllCategorySizes);
module.exports = categoryRouter;
