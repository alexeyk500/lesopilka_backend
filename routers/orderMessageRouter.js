const Router = require('express');
const orderMessageRouter = new Router();
const authMiddleware = require('../middleware/authMiddleware');
const orderMessageController = require('../controllers/orderMessageController');

orderMessageRouter.post('/', authMiddleware, orderMessageController.createNewOrderMessage);

module.exports = orderMessageRouter;
