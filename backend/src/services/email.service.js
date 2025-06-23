const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

/**
 * Hàm gửi email
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 */
const sendEmail = async (to, subject, html) => {
    // Chỉ gửi email nếu các biến môi trường đã được cấu hình
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.log("Email service is not configured. Skipping email sending.");
        return;
    }
    
    try {
        await transporter.sendMail({
            from: `"TaxFlow System" <${process.env.GMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html,
        });
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
    }
};

module.exports = { sendEmail };