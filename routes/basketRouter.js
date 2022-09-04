const Router = require('express');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const basketController = require('../controllers/basketController');
const basketRouter = new Router();

basketRouter.post('/put', checkRoleMiddleware('ADMIN'), basketController.putToBasket);

module.exports = basketRouter;
