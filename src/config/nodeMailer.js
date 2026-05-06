const SibApiV3Sdk = require("sib-api-v3-sdk");
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async ({ to, subject, html }) => {
  try {
    const result = await apiInstance.sendTransacEmail({
      sender: { email: process.env.EMAIL_FROM },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    console.log("✅ Email envoyé:", result);
    return { success: true, data: result };

  } catch (error) {
    console.error("❌ BREVO ERROR:", error.response?.body || error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.NODE_MAIL_USER_EMAIL,
//     pass: process.env.NODE_MAIL_PASS,
//   }
// });

// module.exports = transporter;
