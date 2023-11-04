'use strict';

const nodemailer = require('nodemailer');
const config = require('../../config/default.json');
const logger = require('./winston');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587, // 보안없는경우 587, 있는경우 465로 설정. 기본은 587
  auth: {
    user: config.mail_info.user,
    pass: config.mail_info.pass,
  },
});

exports.verifycodeMail = async (email, code) => {
  let mailOptions = {
    from: config.mail_info.user,
    to: email,
    subject: 'Verifying Code by CSW_BOARD',
    text: `Your Verifycode is ${code}.`,
  };
  let send = await transporter.sendMail(mailOptions);
  if (send) {
    logger.info(`'send verifycode to ${email}'`);
    //console.log('send OK');
    return 'Mail send success.';
  } else {
    throw new Error('Mail send fail.');
  }
};
