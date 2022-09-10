const ApiError = require('../error/apiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/userModels');
const uuid = require('uuid');

const generateJwt = ({ userId, userEmail, userRole, secretKey }) => {
  return jwt.sign({ id: userId, email: userEmail, role: userRole }, secretKey, { expiresIn: '24h' });
};

class UserController {
  async registration(req, res, next) {
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
    const token = generateJwt({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      secretKey: process.env.SECRET_KEY,
    });
    return res.json({ token });
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(ApiError.internal('User not found'));
    }
    const comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      return next(ApiError.internal('Password is not correct'));
    }
    const token = generateJwt({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      secretKey: process.env.SECRET_KEY,
    });
    return res.json({ token });
  }

  async check(req, res) {
    const token = generateJwt({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      secretKey: process.env.SECRET_KEY,
    });
    return res.json({ token });
  }

  async sendConfirmationEmail(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email && !password) {
        return next(ApiError.internal('User not found'));
      }
      const code = uuid.v4();
      const time = new Date().toISOString();
      console.log(`sendConfirmationEmail ${email} ${password} ${code} ${time}`);
      return res.json({ message: `Register confirmation email has been sent to ${email} in ${time}` });
    } catch (e) {
      return next(ApiError.badRequest(e.original.detail));
    }
  }
}

module.exports = new UserController();
