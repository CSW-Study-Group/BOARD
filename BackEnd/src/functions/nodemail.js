'use strict';

const nodemailer = require('nodemailer');
const sender_info = require('../../config/senderInfo.json');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587, // 보안없는경우 587, 있는경우 465로 설정. 기본은 587
    auth: {
        user: sender_info.user,
        pass: sender_info.pass
    }
});

exports.passwordMail = async (email, password) => {
    console.log('mailer');
    let mailOptions = {
        from: sender_info,
        to: email,
        subject: 'Temporary Password by CSW_BOARD',
        text: `Your temporary password is ${password}.`
    };;
    let send = await transporter.sendMail(mailOptions);
    if (send) {
        return 'Mail send success.'
    } else {
        throw new Error('Mail send fail.');
    }
};