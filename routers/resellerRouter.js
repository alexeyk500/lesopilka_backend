const Router = require('express');
const resellerController = require('../controllers/resellerController');
const authMiddleware = require('../middleware/authMiddleware');
const resellerRouter = new Router();

resellerRouter.post('/create', authMiddleware, resellerController.createReseller);
resellerRouter.post(
  '/create-reseller-manufacturer-candidate',
  authMiddleware,
  resellerController.createResellerManufacturerCandidate
);
resellerRouter.get('/reseller-manufacturers-list', authMiddleware, resellerController.getResellerManufacturersList);

module.exports = resellerRouter;
