const ApiError = require('../error/apiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, UnconfirmedUser, PasswordRecoveryCode, SearchRegionAndLocation } = require('../models/userModels');
const uuid = require('uuid');
const { makeMailData, transporter } = require('../nodemailer/nodemailer');
const { makeRegistrationConfirmLetter } = require('../nodemailer/registrationConfirmEmail');
const { passwordRecoveryCodeEmail } = require('../nodemailer/passwordRecoveryCodeEmail');
const { Location, Region, Address } = require('../models/addressModels');
const { Manufacturer } = require('../models/manufacturerModels');
const { formatManufacturer, updateModelsField } = require('../utils/functions');
const { Basket } = require('../models/basketModels');

const generateUserToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: '24h' });
};

const getUserResponse = async (userId, tokenRaw) => {
  const user = await User.findOne({
    where: { id: userId },
    include: [
      {
        model: SearchRegionAndLocation,
        include: [Region, Location],
      },
      {
        model: Manufacturer,
        include: [{ model: Address, include: [{ model: Location, include: [{ model: Region }] }] }],
      },
    ],
  });

  let token;
  if (tokenRaw) {
    token = tokenRaw;
  } else {
    token = generateUserToken(user);
  }

  return {
    user: {
      email: user.email,
      name: user.name ? user.name : user.email,
      phone: user.phone ? user.phone : undefined,
      searchRegion: user.searchRegionAndLocation.region
        ? { id: user.searchRegionAndLocation.region.id, title: user.searchRegionAndLocation.region.title }
        : undefined,
      searchLocation: user.searchRegionAndLocation.location
        ? { id: user.searchRegionAndLocation.location.id, title: user.searchRegionAndLocation.location.title }
        : undefined,
      manufacturer: user.manufacturer ? formatManufacturer(user.manufacturer) : undefined,
    },
    token,
  };
};

class UserController {
  async registration(req, res, next) {
    try {
      const { email, password, role } = req.body;
      if (!email || !password) {
        return next(ApiError.badRequest('Not valid user password or email'));
      }
      const candidate = await User.findOne({ where: { email } });
      if (candidate) {
        return next(ApiError.badRequest(`User with email ${email} already exist`));
      }
      const hashPassword = await bcrypt.hash(password, 3);
      const user = await User.create({ email, password: hashPassword, role });
      await Basket.create({ userId: user.id });
      await SearchRegionAndLocation.create({ userId: user.id });
      const response = await getUserResponse(user.id);
      return res.json(response);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return next(ApiError.internal('User not found'));
      }
      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return next(ApiError.internal('Password is not correct'));
      }
      const response = await getUserResponse(user.id);
      return res.json(response);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async getUserByToken(req, res, next) {
    try {
      const email = req.user.email;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return next(ApiError.internal('User not found'));
      }
      const response = await getUserResponse(user.id);
      return res.json(response);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async updateUser(req, res, next) {
    try {
      const userEmail = req.user.email;
      const token = req.headers.authorization.split(' ')[1];
      const user = await User.findOne({ where: { email: userEmail } });
      if (!user) {
        return next(ApiError.internal('User not found'));
      }
      const searchRegionAndLocation = await SearchRegionAndLocation.findOne({ where: { userId: user.id } });
      if (!searchRegionAndLocation) {
        return next(ApiError.internal(`SearchRegionAndLocation not found for userId = ${user.id}`));
      }
      const { name, phone, password, searchRegionId, searchLocationId } = req.body;
      await updateModelsField(user, { name });
      await updateModelsField(user, { phone });
      await updateModelsField(searchRegionAndLocation, { regionId: searchRegionId });
      await updateModelsField(searchRegionAndLocation, { locationId: searchLocationId });

      if (password) {
        const hashPassword = await bcrypt.hash(password, 3);
        await user.update({ password: hashPassword });
      }
      const response = await getUserResponse(user.id, token);
      return res.json(response);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async sendConfirmationEmail(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email && !password) {
        return next(ApiError.internal('Bad request no user email or password'));
      }
      const candidate = await User.findOne({ where: { email } });
      if (candidate) {
        return next(ApiError.badRequest(`User with email ${email} already exist`));
      }
      const code = uuid.v4();
      const time = new Date().toISOString();
      const subject = 'Подтверждение регистрации на lesopilka24.ru';
      const html = makeRegistrationConfirmLetter(code);
      const mailData = makeMailData({ to: email, subject, html });
      await transporter.sendMail(mailData, async function (err, info) {
        if (err) {
          return next(ApiError.internal(`Error with sending Confirmation Registration letter, ${err}`));
        } else {
          console.log(`sendMail-${info}`);
        }
        const hashPassword = await bcrypt.hash(password, 3);
        await UnconfirmedUser.create({ email, password: hashPassword, code, time });
        return res.json({ message: `Register confirmation email has been sent to ${email} in ${time}` });
      });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async confirmRegistration(req, res, next) {
    try {
      const { code } = req.params;
      if (!code) {
        return next(ApiError.internal('Wrong link from registration email'));
      }
      const candidate = await UnconfirmedUser.findOne({ where: { code } });
      if (!candidate) {
        return next(ApiError.badRequest(`Wrong link from registration email`));
      }
      const email = await candidate.get('email');
      const password = await candidate.get('password');
      await User.create({ email, password });
      await UnconfirmedUser.destroy({ where: { code } });
      return res.redirect(process.env.SUCCESS_REGISTRATION_SITE_PAGE);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async sendRecoveryPasswordEmail(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return next(ApiError.internal('Bad request no user email'));
      }
      const candidate = await User.findOne({ where: { email } });
      if (!candidate) {
        return next(ApiError.badRequest(`User with email ${email} do not exist`));
      }
      const code = uuid.v4().slice(0, 6);
      const time = new Date().toISOString();
      const subject = 'Востановление пароля на lesopilka24.ru';
      const html = passwordRecoveryCodeEmail(code);
      const mailData = makeMailData({ to: email, subject, html });
      await transporter.sendMail(mailData, async function (err, info) {
        if (err) {
          return next(ApiError.internal(`Error with sending recovery password letter, ${err}`));
        } else {
          console.log(`sendMail-${info}`);
        }
        await PasswordRecoveryCode.destroy({ where: { email } });
        await PasswordRecoveryCode.create({ email, code, time });
        return res.json({ message: `Letter with password recovery code has been sent to ${email} in ${time}` });
      });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async confirmRecoveryPasswordCode(req, res, next) {
    try {
      const { code, password } = req.body;
      if (!code && !password) {
        return next(ApiError.internal('Wrong code or password from recovery password email'));
      }
      const candidate = await PasswordRecoveryCode.findOne({ where: { code } });
      if (!candidate) {
        return next(ApiError.badRequest(`This recovery code does not exist`));
      }
      const email = await candidate.get('email');
      const hashPassword = await bcrypt.hash(password, 3);
      await User.update({ password: hashPassword }, { where: { email } });
      await PasswordRecoveryCode.destroy({ where: { code } });
      return res.json({ message: `Пароль для пользователя ${email}\n был успешно сменен` });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new UserController();
