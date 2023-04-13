const Router = require('express');
const ManufacturerController = require('../controllers/manufacturerController');
const authMiddleware = require('../middleware/authMiddleware');
const manufacturerRouter = new Router();

manufacturerRouter.post('/create', authMiddleware, ManufacturerController.createManufacturer);

module.exports = manufacturerRouter;
