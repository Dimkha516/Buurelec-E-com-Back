// services/mailService.js
const transporter = require("../config/nodeMailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("✅ Email envoyé:", info.messageId);

    return {
      success: true,
      data: info,
    };
  } catch (error) {
    console.error("❌ NODEMAILER ERROR:", error.message);
    console.error(`Email target ${to}`);

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = { sendEmail };
