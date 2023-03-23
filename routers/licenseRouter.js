const Router = require('express');
const licenseRouter = new Router();
const authMiddleware = require('../middleware/authMiddleware');

const licenseController = require('../controllers/licenseController');

licenseRouter.post('/', authMiddleware, licenseController.licensePurchase);

module.exports = licenseRouter;
