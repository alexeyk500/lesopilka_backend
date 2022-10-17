const Router = require('express');
const addressRouter = new Router();
const addressController = require('../controllers/addressController');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');

addressRouter.post('/region', checkRoleMiddleware('ADMIN'), addressController.createRegion);
addressRouter.post('/city', checkRoleMiddleware('ADMIN'), addressController.createCity);
addressRouter.post('/address', checkRoleMiddleware('ADMIN'), addressController.createAddress);
addressRouter.get('/user_addresses/:userId', addressController.getUserAddresses);
addressRouter.get('/regions', addressController.getRegions);
addressRouter.get('/locations', addressController.getLocations);
addressRouter.get('/locations/:regionId', addressController.getLocationsByRegionId);

module.exports = addressRouter;
