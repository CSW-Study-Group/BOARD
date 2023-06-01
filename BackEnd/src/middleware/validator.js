'use strict';

const { validationResult } = require('express-validator');

exports.validator = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ code: 400, message: errors.array()[0].msg });
};