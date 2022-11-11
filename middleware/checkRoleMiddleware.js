const jwt = require('jsonwebtoken');

module.exports = function (roles) {
  return function (req, res, next) {
    if (req.method === 'OPTIONS') {
      next();
    }
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'user is not authorized' });
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      if (!roles.includes(decoded.role)) {
        return res.status(401).json({ message: 'You do not have access rights' });
      }
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ message: 'user is not authorized' });
    }
  };
};
