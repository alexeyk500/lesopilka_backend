const ApiError = require('../error/apiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, UnconfirmedUser, PasswordRecoveryCode } = require('../models/userModels');
const uuid = require('uuid');
const { makeMailData, transporter } = require('../nodemailer/nodemailer');
const { makeRegistrationConfirmLetter } = require('../nodemailer/registrationConfirmEmail');
const { passwordRecoveryCodeEmail } = require('../nodemailer/passwordRecoveryCodeEmail');
const { Location } = require('../models/addressModels');

const generateUserToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: '24h' });
};

const getUserResponse = async (user) => {
  let searchRegion;
  let searchLocation;
  let manufacturerRegion;
  let manufacturerLocation;
  const token = generateUserToken(user);
  if (user.searchLocationId) {
    searchLocation = await Location.findOne({ where: { id: user.searchLocationId } });
  }
  if (user.searchRegionId) {
    searchRegion = await Location.findOne({ where: { id: user.searchRegionId } });
  }
  if (user.manufacturerRegionId) {
    manufacturerRegion = await Location.findOne({ where: { id: user.manufacturerRegionId } });
  }
  if (user.manufacturerLocationId) {
    manufacturerLocation = await Location.findOne({ where: { id: user.manufacturerLocationId } });
  }
  return {
    user: {
      email: user.email,
      name: user.name ? user.name : user.email,
      searchRegion: searchRegion ? { id: searchRegion.id, title: searchRegion.title } : undefined,
      searchLocation: searchLocation ? { id: searchLocation.id, title: searchLocation.title } : undefined,
      manufacturer: manufacturerLocation
        ? {
          inn: user.manufacturerInn,
          title: user.manufacturerTitle,
          region: { id: manufacturerRegion.id, title: manufacturerRegion.title },
          location: { id: manufacturerLocation.id, title: manufacturerLocation.title }
          }
        : undefined,
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
      const response = await getUserResponse(user);
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
      const response = await getUserResponse(user);
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
      const response = await getUserResponse(user);
      return res.json(response);
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }

  async updateUser(req, res, next) {
    try {
      const userEmail = req.user.email;
      const user = await User.findOne({ where: { email: userEmail } });
      if (!user) {
        return next(ApiError.internal('User not found'));
      }
      const { name, password } = req.body;
      if (name) {
        await user.update({ name });
      }
      if (password) {
        const hashPassword = await bcrypt.hash(password, 3);
        await user.update({ password: hashPassword });
      }
      const response = await getUserResponse(user);
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
