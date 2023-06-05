'use strict';

const logger = require('../functions/winston');

exports.success = (res, code, message = 'No message.', data = 'No data.') => {
  if (typeof data.access_token === 'undefined' && typeof data.refresh_token === 'undefined') {
    return res.status(code).json({
      code: code,
      message: message,
      data: data,
    });
  } else {
    return res.status(code).json({
      code: code,
      message: message,
      data: data,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
  }
};

exports.fail = (res, code, message = 'No message.', detail = 'No detail.') => {
  if (code >= 500) {
    logger.error(`'${message}'`);
    return res.status(code).json({
      message: message,
      detail: detail,
    });
  } else if (code >= 400) {
    logger.warn(`'${message}'`);
    return res.status(code).json({
      message: message,
      detail: detail,
    });
  }
};
