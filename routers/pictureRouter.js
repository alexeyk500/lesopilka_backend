const Router = require('express');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const pictureController = require('../controllers/pictureController');
const pictureRouter = new Router();

pictureRouter.post('/', checkRoleMiddleware('ADMIN'), pictureController.uploadPicture);
pictureRouter.delete('/', checkRoleMiddleware('ADMIN'), pictureController.deletePicture);

module.exports = pictureRouter;
