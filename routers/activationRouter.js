const Router = require('express');
const activationController = require('../controllers/activationController');
const activationRouter = new Router();

activationRouter.post('/activate-user-candidate', activationController.activateUserCandidate);
activationRouter.post(
  '/activate-reseller-manufacturer-candidate',
  activationController.activateResellerManufacturerCandidate
);

module.exports = activationRouter;
