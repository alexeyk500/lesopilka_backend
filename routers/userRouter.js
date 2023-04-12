const Router = require('express');
const userRouter = new Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

userRouter.post('/registration', UserController.registration);
userRouter.post('/login', UserController.login);
userRouter.get('/auth', authMiddleware, UserController.getUserByToken);
userRouter.get('/get_user', authMiddleware, UserController.getUserByToken);
userRouter.post('/create-unconfirmed-user', UserController.createUnconfirmedUser);
userRouter.get('/confirm_registration/:code', UserController.confirmRegistration);
userRouter.post('/send_recovery_password_email', UserController.sendRecoveryPasswordEmail);
userRouter.post('/confirm_recovery_password_code', UserController.confirmRecoveryPasswordCode);

userRouter.post('/delete-test-user', UserController.deleteTestUser);

userRouter.put('/', authMiddleware, UserController.updateUser);

module.exports = userRouter;
