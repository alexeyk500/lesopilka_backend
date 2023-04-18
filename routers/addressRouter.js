const Router = require('express');
const addressRouter = new Router();
const addressController = require('../controllers/addressController');
const authMiddleware = require('../middleware/authMiddleware');

addressRouter.post('/region', authMiddleware, addressController.createRegion);
addressRouter.post('/location', authMiddleware, addressController.createLocation);
addressRouter.post('/address', authMiddleware, addressController.createAddress);
addressRouter.get('/regions', addressController.getRegions);
addressRouter.get('/locations', addressController.getLocations);
addressRouter.get('/locations/:regionId', addressController.getLocationsByRegionId);

module.exports = addressRouter;
