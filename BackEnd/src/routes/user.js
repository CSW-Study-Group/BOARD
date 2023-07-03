'use strict';

const { auth } = require('../middleware/verifyJWT');
const { issuanceToken } = require('../functions/signJWT');

const express = require('express');
const router = express.Router();

const { validator } = require('../middleware/validator');
const { check } = require('express-validator');

const { imgUpload } = require('../middleware/multer.js');
const ctrl = require('../controllers/user');

// methods for user
router.post(
  '/login',
  [check('email', 'Please input id.').notEmpty(), check('password', 'Please input password.').notEmpty(), validator],
  ctrl.postLogin,
);

router.post(
  '/register',
  [
    check('user_name', 'Username must be longer than 2 characters & shorter than 31 characters.').isLength({
      min: 3,
      max: 30,
    }),
    check('email')
      .isEmail()
      .withMessage('Email must be in the correct format.')
      .isLength({ max: 30 })
      .withMessage('Email must be shorter than 31 characters.'),
    check('password', 'Password must be longer than 2 characters & shorter than 101 characters.').isLength({
      min: 3,
      max: 100,
    }),
    validator,
  ],
  ctrl.postRegister,
);

router.get('/profile', auth, ctrl.getProfile);
router.patch(
  '/profile',
  auth,
  imgUpload,
  [
    check('user_name')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be longer than 2 characters & shorter than 31 characters.'),
    check('email')
      .isEmail()
      .withMessage('Email must be in the correct format.')
      .isLength({ max: 30 })
      .withMessage('Email must be shorter than 31 characters.'),
    validator,
  ],
  ctrl.updateProfile,
);

router.post('/attendance', auth, ctrl.postAttendance);
router.get('/attendance', auth, ctrl.getAttendance);

// token refresh
router.get('/token/refresh', issuanceToken);

// rendering page
router.get('/login', ctrl.viewLogin);
router.get('/register', ctrl.viewRegister);
router.get('/profile/output/', ctrl.viewProfile);
router.get('/attendance/output', ctrl.viewAttend);

module.exports = router;
