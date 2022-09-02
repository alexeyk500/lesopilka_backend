const Router = require('express');
const userRouter = require('./userRouter');
const addressRouter = require('./addressRouter');
const categoryRouter = require('./categoryRouter');
const productRouter = require('./productRouter');
const pictureRouter = require('./pictureRouter');

const router = new Router();

router.use('/user', userRouter);
router.use('/address', addressRouter);
router.use('/category', categoryRouter);
router.use('/product', productRouter);
router.use('/picture', pictureRouter);

router.use('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

module.exports = router;
