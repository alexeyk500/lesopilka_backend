const Router = require('express');
const priceRouter = new Router();
const priceController = require('../controllers/priceController');

priceRouter.get('/:mid', priceController.getPricePDF);

module.exports = priceRouter;
