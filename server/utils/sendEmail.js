// utils/sendEmail.js
const nodemailer = require("nodemailer");

module.exports = async function sendEmail({ to, subject, text }) {
  // create reusable transporter
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,    // your Gmail address
      pass: process.env.EMAIL_PASS,    // the app password you generated
    },
  });

  await transporter.sendMail({
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};
