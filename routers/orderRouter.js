const Router = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const orderRouter = new Router();

orderRouter.get('/payment_methods', orderController.getPaymentMethods);
orderRouter.get('/delivery_methods', orderController.getDeliveryMethods);
orderRouter.get('/pick_up_address/:mid', orderController.getManufacturerPickUpAddress);
orderRouter.get('/:id', authMiddleware, orderController.getOrderInfo);
orderRouter.post('/new_order', authMiddleware, orderController.createNewOrder);
orderRouter.post('/cancel_order_return_to_basket', authMiddleware, orderController.cancelOrderAndReturnToBasket);
orderRouter.post('/', authMiddleware, orderController.getOrdersListByParams);
orderRouter.post('/confirm', authMiddleware, orderController.confirmOrderFromManufacturer);
orderRouter.post('/archive', authMiddleware, orderController.sendOrderToArchive);

module.exports = orderRouter;
