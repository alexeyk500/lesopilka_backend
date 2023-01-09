const Router = require('express');
const orderController = require('../controllers/orderController');
const orderRouter = new Router();

orderRouter.get('/payment_methods', orderController.getPaymentMethods);
orderRouter.get('/delivery_methods', orderController.getDeliveryMethods);
orderRouter.get('/pick_up_address/:mid', orderController.getManufacturerPickUpAddress);

module.exports = orderRouter;
