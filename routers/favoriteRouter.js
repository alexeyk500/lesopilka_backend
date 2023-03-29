const Router = require('express');
const favoriteRouter = new Router();
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/authMiddleware');

favoriteRouter.get('/', authMiddleware, favoriteController.getFavoriteProducts);
favoriteRouter.post('/', authMiddleware, favoriteController.createFavoriteProduct);
favoriteRouter.delete('/', authMiddleware, favoriteController.deleteFavoriteProduct);

module.exports = favoriteRouter;
