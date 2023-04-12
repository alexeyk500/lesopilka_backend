const uuid = require('uuid');
const ApiError = require('../error/apiError');
const { getUserResponse } = require('../utils/userFunction');
const { Reseller, ResellerManufacturerCandidate } = require('../models/resellerModels');
const { Address } = require('../models/addressModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { serverResponseHandler, serverErrorHandler } = require('../utils/serverHandler');
const {
  checkIsUserExist,
  checkIsManufacturerExist,
  checkIsResellerManufacturerCandidateExist,
} = require('../utils/checkFunctions');

const userController = require('../controllers/userController');
const manufacturerController = require('../controllers/manufacturerController');
const addressController = require('../controllers/addressController');
const resellerRegisterManufacturerConfirmEmail = require('../nodemailer/resellerManufacturerCandidateConfirmEmail');
const { makeMailData, transporter } = require('../nodemailer/nodemailer');
const { User } = require('../models/userModels');
const { updateModelsField } = require('../utils/functions');

class ResellerController {
  async createReseller(req, res, next) {
    try {
      const userId = req.user.id;
      const { family, name, middleName, phone, locationId } = req.body;
      if (!userId || !family || !name || !middleName || !phone || !locationId) {
        return next(ApiError.badRequest('createReseller - request data is not complete'));
      }
      const manufacturerCandidate = await Manufacturer.findOne({ where: { userId } });
      if (manufacturerCandidate) {
        return next(ApiError.badRequest(`User already has been registered as manufacturer`));
      }
      const resellerCandidate = await Reseller.findOne({ where: { userId } });
      if (resellerCandidate) {
        return next(ApiError.badRequest(`User already has been registered as reseller`));
      }
      const resellerCandidateWithPhone = await Reseller.findOne({ where: { phone } });
      if (resellerCandidateWithPhone) {
        return next(ApiError.badRequest(`Reseller with phone=${phone} already exist`));
      }
      const address = await Address.create({ locationId });
      await Reseller.create({ family, name, middleName, phone, userId, addressId: address.id });

      const response = await getUserResponse(userId);
      return res.json(response);
    } catch (e) {
      return next(ApiError.badRequest(e?.original?.detail ? e.original.detail : 'createReseller - unknownError'));
    }
  }

  async manufacturerCandidate(req, res, next) {
    try {
      const userId = req.user.id;
      const { title, inn, phone, email, locationId, street, building, office, postIndex } = req.body;
      if (!userId || !title || !inn || !phone || !email || !locationId || (!street && !building) || !postIndex) {
        return next(ApiError.badRequest('resellerRegisterManufacturer - request data is not complete'));
      }

      const userCandidate = await User.findOne({ where: { id: userId } });
      if (!userCandidate) {
        return next(ApiError.badRequest(`resellerRegisterManufacturer - request denied 1`));
      }

      const resellerCandidate = await Reseller.findOne({ where: { userId } });
      if (!resellerCandidate) {
        return next(ApiError.badRequest(`resellerRegisterManufacturer - request denied 2`));
      }

      const isUserExist = await checkIsUserExist({ email, phone });
      if (isUserExist) {
        return next(ApiError.badRequest(isUserExist));
      }

      const isManufacturerExist = await checkIsManufacturerExist({ email, phone, inn });
      if (isManufacturerExist) {
        return next(ApiError.badRequest(isManufacturerExist));
      }

      const isResellerManufacturerCandidateExist = await checkIsResellerManufacturerCandidateExist({
        email,
        phone,
        inn,
      });
      if (isResellerManufacturerCandidateExist) {
        return next(ApiError.badRequest(isResellerManufacturerCandidateExist));
      }

      const code = uuid.v4().slice(0, 8);
      const time = new Date().toISOString();
      const resellerId = resellerCandidate.id;
      await ResellerManufacturerCandidate.create({
        title,
        inn,
        phone,
        email,
        locationId,
        street,
        building,
        office,
        postIndex,
        resellerId,
        code,
        time,
      });

      const resellerFIO = `${resellerCandidate.family} ${resellerCandidate.name}`;
      const resellerPhone = resellerCandidate.phone;
      const resellerEmail = userCandidate.email;
      const subject = `Подтверждение регистрации поставщика на ${process.env.SITE_NAME}`;
      const html = resellerRegisterManufacturerConfirmEmail({ resellerFIO, resellerPhone, resellerEmail, code });
      const mailData = makeMailData({ to: 'alexeyk500@yandex.ru', subject, html });
      return await transporter.sendMail(mailData, async function (err, info) {
        if (err) {
          return next(ApiError.internal(`Error with sending resellerRegisterManufacturerConfirmEmail letter, ${err}`));
        } else {
          console.log(`sendMail-${info}`);
        }
        return res.json({
          message: `Reseller register new manufacturer confirmation email has been sent to ${email} in ${time}`,
        });
      });
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'resellerRegisterManufacturer - unknownError')
      );
    }
  }

  async manufacturerCandidateActivate(req, res, next) {
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
            `\nкод активации уже был задействован,\nвойдите в аккаунт производителя\nс тем адресом электронной почты,\nна которую пришло письмо о регистрации`
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
      const userResult = await userController.registration(
        { body: { email, password } },
        serverResponseHandler,
        serverErrorHandler
      );
      if (userResult.status !== 200) {
        return next(ApiError.badRequest(`activateManufacturerCandidate - ${userResult.message}`));
      }

      const locationId = manufacturerCandidate.locationId;
      const street = manufacturerCandidate.street;
      const building = manufacturerCandidate.building;
      const office = manufacturerCandidate.office;
      const postIndex = manufacturerCandidate.postIndex;
      const addressResult = await addressController.createAddress(
        { body: { locationId, street, building, office, postIndex } },
        serverResponseHandler,
        serverErrorHandler
      );
      if (addressResult.status !== 200) {
        return next(ApiError.badRequest(`activateManufacturerCandidate - ${addressResult.message}`));
      }

      const newUserId = userResult.response.user.id;
      const addressId = addressResult.response.id;
      const name = manufacturerCandidate.title;
      const updateUserResult = await userController.updateUser(
        {
          user: { id: newUserId },
          headers: { authorization: '' },
          body: { name, phone, addressId },
        },
        serverResponseHandler,
        serverErrorHandler
      );
      if (updateUserResult.status !== 200) {
        return next(ApiError.badRequest(`activateManufacturerCandidate - ${updateUserResult.message}`));
      }

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

      await updateModelsField(manufacturerCandidate, { isActivated: true });
      // await setManufacturerWelcomeLicenses(manufacturerResult.response.id, next);

      const response = await getUserResponse(newUserId);
      return res.json(response);
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'activateManufacturerCandidate - unknownError')
      );
    }
  }
}

module.exports = new ResellerController();
