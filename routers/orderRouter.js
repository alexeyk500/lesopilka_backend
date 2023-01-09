const Router = require('express');
const orderController = require('../controllers/orderController');
const orderRouter = new Router();

orderRouter.get('/payment_methods', orderController.getPaymentMethods);

module.exports = orderRouter;
