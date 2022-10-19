const Router = require('express');
const ManufacturerController = require("../controllers/manufacturerController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");
const manufacturerRouter = new Router();

manufacturerRouter.post('/', checkRoleMiddleware('ADMIN'), ManufacturerController.createManufacturer);

module.exports = manufacturerRouter;
