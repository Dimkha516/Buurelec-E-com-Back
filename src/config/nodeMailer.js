const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_MAIL_USER_EMAIL,
    pass: process.env.NODE_MAIL_PASS,
  },
  family: 4,
});

module.exports = transporter;
