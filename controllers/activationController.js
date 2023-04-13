const ApiError = require('../error/apiError');
const { UserCandidate } = require('../models/userModels');
const { checkIsUserExist } = require('../utils/checkFunctions');
const { serverResponseHandler, serverErrorHandler } = require('../utils/serverHandler');

const userController = require('../controllers/userController');
const { getUserResponse } = require('../utils/userFunction');
const { updateModelsField } = require('../utils/functions');

class ActivationController {
  async activateUserCandidate(req, res, next) {
    try {
      const { code } = req.body;
      if (!code) {
        return next(ApiError.badRequest('activateUserCandidate - request data is not complete'));
      }

      const userCandidate = await UserCandidate.findOne({ where: { code } });
      if (!userCandidate) {
        return next(ApiError.badRequest(`код активации не действителен`));
      }
      if (userCandidate.isActivated) {
        return next(
          ApiError.badRequest(
            `\nкод активации уже был задействован,\nвойдите в аккаунт пользователя\nс тем адресом электронной почты,\nкоторый вы указали при регистрации`
          )
        );
      }

      const email = userCandidate.email;
      const isUserExist = await checkIsUserExist({ email });
      if (isUserExist) {
        return next(ApiError.badRequest(isUserExist));
      }

      const password = userCandidate.password;
      const userResult = await userController.createUser(
        { body: { email, password } },
        serverResponseHandler,
        serverErrorHandler
      );
      if (userResult.status !== 200) {
        return next(ApiError.badRequest(`activateUserCandidate - ${userResult.message}`));
      }

      await updateModelsField(userCandidate, { isActivated: true });
      const response = await getUserResponse(userResult.response.user.id);
      return res.json(response);
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'activateManufacturerCandidate - unknownError')
      );
    }
  }
}

module.exports = new ActivationController();
