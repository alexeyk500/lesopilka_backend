const Router = require('express');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const pictureController = require('../controllers/pictureController');
const pictureRouter = new Router();

pictureRouter.post('/', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), pictureController.uploadPicture);
pictureRouter.delete('/', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), pictureController.deletePicture);

module.exports = pictureRouter;
