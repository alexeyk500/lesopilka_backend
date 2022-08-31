const Router = require('express');
const addressRouter = new Router();
const addressController = require('../controllers/addressController');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');

addressRouter.post('/region', checkRoleMiddleware('ADMIN'), addressController.createRegion);
addressRouter.post('/city', checkRoleMiddleware('ADMIN'), addressController.createCity);
addressRouter.post('/street', checkRoleMiddleware('ADMIN'), addressController.createStreet);
addressRouter.post('/address', checkRoleMiddleware('ADMIN'), addressController.createAddress);
addressRouter.get('/user_addresses/:user_id', addressController.getUserAddresses);

module.exports = addressRouter;
