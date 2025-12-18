require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('Testing Email Configuration...');
    console.log('User:', process.env.EMAIL_USER);
    // Do not log password

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.verify();
        console.log('SMTP Connection Successful!');

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'AinAdvocate Test Email',
            text: 'If you see this, email configuration is working!'
        });
        console.log('Test Email Sent Successfully!');
    } catch (error) {
        console.error('SMTP Connection Failed:', error);
    }
};

testEmail();
