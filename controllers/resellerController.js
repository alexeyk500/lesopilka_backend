const uuid = require('uuid');
const ApiError = require('../error/apiError');
const { getUserResponse } = require('../utils/userFunction');
const { Reseller, ResellerManufacturerCandidate, ResellerManufacturer } = require('../models/resellerModels');
const { Address } = require('../models/addressModels');
const { Manufacturer } = require('../models/manufacturerModels');
const {
  checkIsUserExist,
  checkIsManufacturerExist,
  checkIsResellerManufacturerCandidateExist, checkIsValuePositiveNumber,
} = require('../utils/checkFunctions');
const resellerRegisterManufacturerConfirmEmail = require('../nodemailer/resellerManufacturerCandidateConfirmEmail');
const { makeMailData, transporter } = require('../nodemailer/nodemailer');
const { User } = require('../models/userModels');
const { getResellerManufacturersList, getResellerManufacturersLicensesInfoList } = require('../utils/resellerUtils');

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

  async createResellerManufacturerCandidate(req, res, next) {
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

  async getResellerManufacturersList(req, res, next) {
    try {
      const userId = req.user.id;

      const resellerCandidate = await Reseller.findOne({ where: { userId } });
      if (!resellerCandidate) {
        return next(ApiError.badRequest(`getResellerManufacturersList - request denied 1`));
      }

      const manufacturersList = await getResellerManufacturersList(resellerCandidate.id);
      const infoList = await getResellerManufacturersLicensesInfoList(manufacturersList);
      return res.json(infoList);
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'getResellerManufacturersList - unknownError')
      );
    }
  }

  async unregisterResellerManufacturer(req, res, next) {
    try {
      const userId = req.user.id;

      const { manufacturerId } = req.body;
      if (!checkIsValuePositiveNumber(manufacturerId)) {
        return next(ApiError.badRequest('unregisterResellerManufacturer - request denied 1'));
      }

      const resellerCandidate = await Reseller.findOne({ where: { userId } });
      if (!resellerCandidate) {
        return next(ApiError.badRequest(`unregisterResellerManufacturer - request denied 2`));
      }

      const resellerId = resellerCandidate.id
      const resellerManufacturerCandidate = await ResellerManufacturer.findOne({ where: { resellerId, manufacturerId} });
      if (!resellerManufacturerCandidate) {
        return next(ApiError.badRequest(`unregisterResellerManufacturer - request denied 3`));
      }

      await ResellerManufacturer.destroy({ where: { resellerId, manufacturerId} });

      const manufacturersList = await getResellerManufacturersList(resellerId);
      const infoList = await getResellerManufacturersLicensesInfoList(manufacturersList);
      return res.json(infoList);
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unregisterResellerManufacturer - unknownError')
      );
    }
  }
}

module.exports = new ResellerController();
