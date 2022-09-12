const Router = require('express');
const userRouter = new Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

userRouter.post('/registration', UserController.registration);
userRouter.post('/login', UserController.login);
userRouter.get('/auth', authMiddleware, UserController.check);
userRouter.post('/send_confirmation_email', UserController.sendConfirmationEmail);
userRouter.get('/confirm_registration/:code', UserController.confirmRegistration);
userRouter.post('/send_recovery_password_email', UserController.sendRecoveryPasswordEmail);
userRouter.post('/confirm_recovery_password_code', UserController.confirmRecoveryPasswordCode);

module.exports = userRouter;
