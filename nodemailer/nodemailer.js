const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  port: process.env.EMAIL_PORT,
  host: process.env.EMAIL_HOST,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
  secure: true,
});

const makeMailData = ({ to, subject, html }) => {
  return {
    from: process.env.EMAIL_ADDRESS,
    to,
    subject,
    html,
  };
};

module.exports.transporter = transporter;
module.exports.makeMailData = makeMailData;
