const Router = require('express');
const userRouter = new Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');

// userRouter.post('/create-user', userController.createUser);
userRouter.post('/login', userController.login);
userRouter.get('/auth', authMiddleware, userController.getUserByToken);
userRouter.get('/get-user', authMiddleware, userController.getUserByToken);
userRouter.post('/create-user-candidate', userController.createUserCandidate);
userRouter.post('/send-recovery-password-email', userController.sendRecoveryPasswordEmail);
userRouter.post('/confirm-recovery-password-code', userController.confirmRecoveryPasswordCode);

userRouter.put('/', authMiddleware, userController.updateUser);

module.exports = userRouter;

// userRouter.get('/confirm_registration/:code', userController.confirmRegistration);
