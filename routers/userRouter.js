const Router = require('express');
const userRouter = new Router();
const userController = require('../controllers/userController');
const activationController = require('../controllers/activationController');

const authMiddleware = require('../middleware/authMiddleware');

userRouter.post('/registration', userController.registration);
userRouter.post('/login', userController.login);
userRouter.get('/auth', authMiddleware, userController.getUserByToken);
userRouter.get('/get_user', authMiddleware, userController.getUserByToken);
userRouter.post('/create-user-candidate', userController.createUserCandidate);
// userRouter.get('/confirm_registration/:code', userController.confirmRegistration);
userRouter.post('/send_recovery_password_email', userController.sendRecoveryPasswordEmail);
userRouter.post('/confirm_recovery_password_code', userController.confirmRecoveryPasswordCode);
userRouter.post('/activate-user-candidate', activationController.activateUserCandidate);

userRouter.post('/delete-test-user', userController.deleteTestUser);

userRouter.put('/', authMiddleware, userController.updateUser);

module.exports = userRouter;
