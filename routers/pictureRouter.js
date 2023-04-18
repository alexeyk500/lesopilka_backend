const Router = require('express');
const pictureController = require('../controllers/pictureController');
const authMiddleware = require('../middleware/authMiddleware');
const pictureRouter = new Router();

pictureRouter.post('/product', authMiddleware, pictureController.uploadProductPicture);
pictureRouter.post('/category', authMiddleware, pictureController.uploadCategoryPicture);
pictureRouter.delete('/', authMiddleware, pictureController.deletePicture);

module.exports = pictureRouter;
