// utils/sendEmail.js
const nodemailer = require("nodemailer");

/**
 * sendEmail sends an email notification using nodemailer.
 * Supports both plain text and HTML content.
 * @param {Object} options
 * @param {string} options.to - Recipient email address(es)
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML body
 */
module.exports = async function sendEmail({ to, subject, text, html }) {
  if (!to || !subject) {
    throw new Error("sendEmail: 'to' and 'subject' are required");
  }
 

  // Create transporter for Gmail using OAuth2 or App Password
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Generate fallback text from HTML if no text provided
  const _text = text || (html ? html.replace(/<[^>]+>/g, "") : undefined);

  const mailOptions = {
    from: `"CheckMyMenu" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: _text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
  } catch (err) {
    console.error("❌ sendEmail error:", err);
    throw err;
  }
};  
