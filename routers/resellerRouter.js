const Router = require('express');
const ResellerController = require('../controllers/resellerController');
const authMiddleware = require('../middleware/authMiddleware');
const resellerRouter = new Router();

resellerRouter.post('/', authMiddleware, ResellerController.createReseller);

module.exports = resellerRouter;
