const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODE_MAIL_USER_EMAIL,
    pass: process.env.NODE_MAIL_PASS,
  },
  family: 4,
});

module.exports = transporter;
// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.NODE_MAIL_USER_EMAIL,
//     pass: process.env.NODE_MAIL_PASS,
//   },
// });

// module.exports = transporter;
