const Router = require('express');
const licenseRouter = new Router();
const authMiddleware = require('../middleware/authMiddleware');

const licenseController = require('../controllers/licenseController');

licenseRouter.post('/', authMiddleware, licenseController.licensePurchase);

licenseRouter.post(
  '/test-manufacturer-inform-licenses-run-out-job',
  authMiddleware,
  licenseController.manufacturerInformLicensesRunOutJobStart
);
licenseRouter.post('/test-manufacturer-depublish', authMiddleware, licenseController.manufacturerDepublishJobStart);
licenseRouter.post('/test-manufacturer-redeem', authMiddleware, licenseController.manufacturerRedeemJobStart);

licenseRouter.post('/test-night-depublish-job', authMiddleware, licenseController.nightDepublishProductsJobStart);
licenseRouter.post('/test-night-redeem-license-job', authMiddleware, licenseController.nightRedeemLicenseJobStart);
licenseRouter.post(
  '/test-night-inform-licenses-run-out-job',
  authMiddleware,
  licenseController.nightInformLicensesRunOutJobStart
);

module.exports = licenseRouter;
