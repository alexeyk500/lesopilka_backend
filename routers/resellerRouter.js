const Router = require('express');
const resellerController = require('../controllers/resellerController');
const authMiddleware = require('../middleware/authMiddleware');
const resellerRouter = new Router();

resellerRouter.post('/', authMiddleware, resellerController.createReseller);
resellerRouter.post(
  '/create-reseller-manufacturer-candidate',
  authMiddleware,
  resellerController.createResellerManufacturerCandidate
);

module.exports = resellerRouter;
