const Router = require('express');
const resellerController = require('../controllers/resellerController');
const authMiddleware = require('../middleware/authMiddleware');
const resellerRouter = new Router();

resellerRouter.post('/create', authMiddleware, resellerController.createReseller);
resellerRouter.post(
  '/create-reseller-manufacturer-candidate-create',
  authMiddleware,
  resellerController.createResellerManufacturerCandidate
);
resellerRouter.get('/reseller-manufacturers-list', authMiddleware, resellerController.getResellerManufacturersList);

resellerRouter.post(
  '/unregister-reseller-manufacturer',
  authMiddleware,
  resellerController.unregisterResellerManufacturer
);

resellerRouter.post(
  '/reseller-manufacturer-license-actions',
  authMiddleware,
  resellerController.getResellerManufacturersLicenseActions
);

resellerRouter.post(
  '/reseller-manufacturers-list-by-date',
  authMiddleware,
  resellerController.getResellerManufacturersListByDate
);

module.exports = resellerRouter;
