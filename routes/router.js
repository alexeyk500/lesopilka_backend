const Router = require('express');
const router = new Router();

const userRouter = require('./userRouter');
const addressRouter = require('./addressRouter');
const categoryRouter = require('./categoryRouter');
const productRouter = require('./productRouter');

router.use('/user', userRouter);
router.use('/address', addressRouter);
router.use('/category', categoryRouter);
router.use('/product', productRouter);

router.use('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

module.exports = router;
