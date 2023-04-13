const ApiError = require('../error/apiError');
const { UserCandidate } = require('../models/userModels');
const { checkIsUserExist, checkIsManufacturerExist } = require('../utils/checkFunctions');
const { serverResponseHandler, serverErrorHandler } = require('../utils/serverHandler');
const { getUserResponse } = require('../utils/userFunction');
const { updateModelsField } = require('../utils/functions');
const { Address } = require('../models/addressModels');
const { ResellerManufacturerCandidate, ResellerManufacturer } = require('../models/resellerModels');
const userController = require('../controllers/userController');
const manufacturerController = require('./manufacturerController');

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

  async activateResellerManufacturerCandidate(req, res, next) {
    try {
      const { code } = req.body;
      if (!code) {
        return next(ApiError.badRequest('activateManufacturerCandidate - request data is not complete'));
      }

      const manufacturerCandidate = await ResellerManufacturerCandidate.findOne({ where: { code } });
      if (!manufacturerCandidate) {
        return next(ApiError.badRequest(`код активации не действителен`));
      }
      if (manufacturerCandidate.isActivated) {
        return next(
          ApiError.badRequest(
            `\nкод активации уже был задействован,\nвойдите в аккаунт производителя\nс тем адресом электронной почты,\nкоторый вы указали при регистрации`
          )
        );
      }

      const email = manufacturerCandidate.email;
      const phone = manufacturerCandidate.phone;
      const isUserExist = await checkIsUserExist({ email, phone });
      if (isUserExist) {
        return next(ApiError.badRequest(isUserExist));
      }

      const inn = manufacturerCandidate.inn;
      const isManufacturerExist = await checkIsManufacturerExist({ email, phone, inn });
      if (isManufacturerExist) {
        return next(ApiError.badRequest(isManufacturerExist));
      }

      const password = manufacturerCandidate.code;

      const userResult = await userController.createUser(
        { body: { email, password } },
        serverResponseHandler,
        serverErrorHandler
      );
      if (userResult.status !== 200) {
        return next(ApiError.badRequest(`activateManufacturerCandidate - ${userResult.message}`));
      }

      const newUserId = userResult.response.user.id;
      const name = manufacturerCandidate.title;
      const updateUserResult = await userController.updateUser(
        {
          user: { id: newUserId },
          headers: { authorization: '' },
          body: { name, phone },
        },
        serverResponseHandler,
        serverErrorHandler
      );
      if (updateUserResult.status !== 200) {
        return next(ApiError.badRequest(`activateManufacturerCandidate - ${updateUserResult.message}`));
      }

      const newUserAddressId = userResult.response.user.address.id;
      const userAddress = await Address.findOne({ where: { id: newUserAddressId } });
      if (!userAddress) {
        return next(ApiError.badRequest(`activateManufacturerCandidate - userAddress not found`));
      }
      const locationId = manufacturerCandidate.locationId;
      await updateModelsField(userAddress, { locationId });
      const street = manufacturerCandidate.street;
      await updateModelsField(userAddress, { street });
      const building = manufacturerCandidate.building;
      await updateModelsField(userAddress, { building });
      const office = manufacturerCandidate.office;
      await updateModelsField(userAddress, { office });
      const postIndex = manufacturerCandidate.postIndex;
      await updateModelsField(userAddress, { postIndex });

      const title = manufacturerCandidate.title;
      const manufacturerResult = await manufacturerController.createManufacturer(
        {
          user: { id: newUserId },
          body: { title, inn, phone, email, locationId, street, building, office, postIndex },
        },
        serverResponseHandler,
        serverErrorHandler
      );
      if (manufacturerResult.status !== 200) {
        return next(ApiError.badRequest(`activateManufacturerCandidate - ${manufacturerResult.message}`));
      }

      const resellerId = manufacturerCandidate.resellerId;
      const manufacturerId = manufacturerResult.response.id;
      await ResellerManufacturer.create({ resellerId, manufacturerId });

      await updateModelsField(manufacturerCandidate, { isActivated: true });

      const response = await getUserResponse(newUserId);
      return res.json(response);
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'activateManufacturerCandidate - unknownError')
      );
    }
  }
}

module.exports = new ActivationController();
