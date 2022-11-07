const Router = require('express');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const pictureController = require('../controllers/pictureController');
const pictureRouter = new Router();

pictureRouter.post('/upload', checkRoleMiddleware('ADMIN'), pictureController.uploadPicture);

module.exports = pictureRouter;
