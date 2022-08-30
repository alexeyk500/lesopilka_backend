const Router = require('express');
const addressRouter = new Router();
const addressController = require('../controllers/addressController');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');

addressRouter.post('/region/', checkRoleMiddleware('ADMIN'), addressController.createRegion);
// brandRouter.delete('/:id', BrandController.delete);
// brandRouter.get('/', BrandController.getAll);

module.exports = addressRouter;
