const Router = require('express');
const router = new Router();

const userRouter = require('./userRouter');
const addressRouter = require('./addressRouter');

router.use('/user', userRouter);
router.use('/address', addressRouter);

router.use('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

module.exports = router;
