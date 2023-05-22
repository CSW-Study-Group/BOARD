'use strict';

const logger = require('../functions/winston');

exports.success = (res, code, method, ip, message = 'No message.', data = 'No data.') => {
  logger.info(`${method} ${code} ${ip.replace(/:/g, '')} : '${message}'`);
  console.log(data);
  console.log(data.access_token);
  return res.status(code).json({
    code: code,
    message: message,
    data: data,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
};

exports.fail = (res, code, method, ip, message = 'No message.', detail = 'No detail.') => {
  if (code >= 500) {
    logger.error(`${method} ${code} ${ip.replace(/:/g, '')} : '${message}'`);
    return res.status(code).json({
      message: message,
      detail: detail,
    });
  } else if (code >= 400) {
    logger.warn(`${method} ${code} ${ip.replace(/:/g, '')} : '${message}'`);
    return res.status(code).json({
      message: message,
      detail: detail,
    });
  }
};
