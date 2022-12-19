const Router = require('express');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const basketController = require('../controllers/basketController');
const authMiddleware = require("../middleware/authMiddleware");
const basketRouter = new Router();

basketRouter.post('/', checkRoleMiddleware(['ADMIN', 'MANUFACTURER']), basketController.putToBasket);
basketRouter.get('/', authMiddleware, basketController.getBasketProducts);

module.exports = basketRouter;
