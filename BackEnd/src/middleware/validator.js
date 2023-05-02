'use strict';

const { validationResult } = require('express-validator');

exports.validator = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {// 에러가 없는 경우
        return next();
    }
    return res.status(400).json({ message: errors.array()[0].msg });
};