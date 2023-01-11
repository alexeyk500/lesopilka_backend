const Router = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const orderRouter = new Router();

orderRouter.get('/payment_methods', orderController.getPaymentMethods);
orderRouter.get('/delivery_methods', orderController.getDeliveryMethods);
orderRouter.get('/pick_up_address/:mid', orderController.getManufacturerPickUpAddress);
orderRouter.get('/:id', authMiddleware, orderController.getOrderInfo);
orderRouter.post('/', authMiddleware, orderController.createNewOrder);
orderRouter.get('/', authMiddleware, orderController.getAllUserOrders);

module.exports = orderRouter;
