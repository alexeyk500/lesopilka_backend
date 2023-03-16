const Router = require('express');
const userRouter = require('./userRouter');
const addressRouter = require('./addressRouter');
const categoryRouter = require('./categoryRouter');
const productRouter = require('./productRouter');
const pictureRouter = require('./pictureRouter');
const basketRouter = require('./basketRouter');
const manufacturerRouter = require('./munufacturerRouter');
const priceRouter = require('./priceRouter');
const orderRouter = require('./orderRouter');
const orderMessageRouter = require('./orderMessageRouter');

const router = new Router();

router.use('/user', userRouter);
router.use('/address', addressRouter);
router.use('/category', categoryRouter);
router.use('/product', productRouter);
router.use('/picture', pictureRouter);
router.use('/baskets', basketRouter);
router.use('/manufacturer', manufacturerRouter);
router.use('/price', priceRouter);
router.use('/orders', orderRouter);
router.use('/order_message', orderMessageRouter);

router.use('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

module.exports = router;
