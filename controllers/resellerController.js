const uuid = require('uuid');
const ApiError = require('../error/apiError');
const { User } = require('../models/userModels');
const { Address } = require('../models/addressModels');
const { getUserResponse } = require('../utils/userFunction');
const { Manufacturer } = require('../models/manufacturerModels');
const { makeMailData, transporter } = require('../nodemailer/nodemailer');
const { Reseller, ResellerManufacturerCandidate, ResellerManufacturer } = require('../models/resellerModels');
const resellerRegisterManufacturerConfirmEmail = require('../nodemailer/resellerManufacturerCandidateConfirmEmail');
const {
  getResellerManufacturersList,
  getResellerManufacturersLicensesInfoList,
  getGroupedResellersManufacturersLicenseActions,
  getResellerManufacturersLicensesInfoListByDate,
} = require('../utils/resellerUtils');
const {
  checkIsUserExist,
  checkIsManufacturerExist,
  checkIsResellerManufacturerCandidateExist,
  checkIsValuePositiveNumber,
  checkIsDateStrIsValidDate,
  checkIsTest,
} = require('../utils/checkFunctions');
const { normalizeData, dateDayShift } = require('../utils/functions');
const { Op } = require('sequelize');
const { LicenseAction } = require('../models/licenseModels');
const { TEST_EMAIL } = require('../utils/constants');

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
      const isTest = checkIsTest(email);
      const mailData = makeMailData({ to: isTest ? TEST_EMAIL : email, subject, html });
      return await transporter.sendMail(mailData, async function (err, info) {
        if (err) {
          return next(ApiError.internal(`Error with sending resellerRegisterManufacturerConfirmEmail letter, ${err}`));
        } else {
          console.log(`sendMail-${info}`);
        }
        return res.json({
          message: `Reseller register new manufacturer confirmation email has been sent to ${email} in ${time} ${
            isTest ? `$${code}` : ''
          }`,
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

      const resellerManufacturers = await getResellerManufacturersList(resellerCandidate.id);
      const infoList = await getResellerManufacturersLicensesInfoList(resellerManufacturers);
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

      const resellerId = resellerCandidate.id;
      const resellerManufacturerCandidate = await ResellerManufacturer.findOne({
        where: { resellerId, manufacturerId },
      });
      if (!resellerManufacturerCandidate) {
        return next(ApiError.badRequest(`unregisterResellerManufacturer - request denied 3`));
      }

      await ResellerManufacturer.destroy({ where: { resellerId, manufacturerId } });

      const manufacturersList = await getResellerManufacturersList(resellerId);
      const infoList = await getResellerManufacturersLicensesInfoList(manufacturersList);
      return res.json(infoList);
    } catch (e) {
      return next(
        ApiError.badRequest(e?.original?.detail ? e.original.detail : 'unregisterResellerManufacturer - unknownError')
      );
    }
  }

  async getResellerManufacturersLicenseActions(req, res, next) {
    try {
      const userId = req.user.id;
      const { dateFrom, dateTo } = req.body;
      if (!userId || !checkIsDateStrIsValidDate(dateFrom) || !checkIsDateStrIsValidDate(dateTo)) {
        return next(ApiError.badRequest('getResellerManufacturersLicenseActions - request denied 1'));
      }

      const resellerCandidate = await Reseller.findOne({ where: { userId } });
      if (!resellerCandidate) {
        return next(ApiError.badRequest(`getResellerManufacturersLicenseActions - request denied 2`));
      }

      const resellerManufacturers = await ResellerManufacturer.findAll({ where: { resellerId: resellerCandidate.id } });
      const manufacturersIdList = resellerManufacturers.map((resMan) => resMan.manufacturerId);

      let searchParams = {};
      searchParams.manufacturerId = manufacturersIdList;
      const normDateFrom = normalizeData(dateFrom);
      const normDateTo = normalizeData(dateDayShift(dateTo, 1));
      searchParams.actionDate = {
        [Op.and]: {
          [Op.gte]: normDateFrom,
          [Op.lte]: normDateTo,
        },
      };
      console.log(searchParams);

      const licenseActionsRaw = await LicenseAction.findAll({
        where: searchParams,
        attributes: { exclude: ['manufacturerId'] },
        order: ['actionDate'],
      });

      const licenseActions = getGroupedResellersManufacturersLicenseActions(licenseActionsRaw);

      return res.json(licenseActions);
    } catch (e) {
      return next(
        ApiError.badRequest(
          e?.original?.detail ? e.original.detail : 'getResellerManufacturersLicenseActions - unknownError'
        )
      );
    }
  }

  async getResellerManufacturersListByDate(req, res, next) {
    try {
      const userId = req.user.id;
      const { date } = req.body;
      if (!userId || !checkIsDateStrIsValidDate(date)) {
        return next(ApiError.badRequest('getResellerManufacturersListByDate - request denied 1'));
      }

      console.log({ userId }, date);
      const resellerCandidate = await Reseller.findOne({ where: { userId } });
      if (!resellerCandidate) {
        return next(ApiError.badRequest(`getResellerManufacturersListByDate - request denied 1`));
      }

      const resellerManufacturers = await getResellerManufacturersList(resellerCandidate.id);

      const infoList = await getResellerManufacturersLicensesInfoListByDate(resellerManufacturers, date);
      return res.json(infoList);
    } catch (e) {
      return next(
        ApiError.badRequest(
          e?.original?.detail ? e.original.detail : 'getResellerManufacturersListByDate - unknownError'
        )
      );
    }
  }
}

module.exports = new ResellerController();
