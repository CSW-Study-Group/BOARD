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

router.post(
  '/verifyPassword',
  auth,
  [
    check('confirm_password', 'Password must be shorter than 101 characters.').isLength({ max: 100 }),
    validator,
  ],
  ctrl.checkPassword);

router.post('/sendEmail', [
  check('email')
    .isEmail()
    .withMessage('Email must be in the correct format.')
    .isLength({ max: 30 })
    .withMessage('Email must be shorter than 31 characters.'),
  validator,
], ctrl.sendVerifyEmail);

router.post('/verifyEmail', [
  check('email')
    .isEmail()
    .withMessage('Email must be in the correct format.')
    .isLength({ max: 30 })
    .withMessage('Email must be shorter than 31 characters.'),
  check('verifycode', 'Please input code.').notEmpty(),
  validator,
], ctrl.checkVerifyCode);

router.patch(
  '/newPassword',
  auth,
  [
    check('new_password', 'Password must be longer than 2 characters & shorter than 101 characters.').isLength({ min: 3, max: 100 }),
    validator,
  ],
  ctrl.editPassword);

// token refresh
router.get('/token/refresh', issuanceToken);

// rendering page
router.get('/login', ctrl.viewLogin);
router.get('/register', ctrl.viewRegister);
router.get('/profile/output/', ctrl.viewProfile);
router.get('/attendance/output', ctrl.viewAttend);
router.get('/verifyPassword', ctrl.viewVerifyPassword); // 비밀번호 확인 페이지 
router.get('/verifyEmail', ctrl.viewverifyEmail); // 인증번호 보내고 체크하는 페이지
router.get('/newPassword', ctrl.viewChangePassword); // 비밀번호 변경 페이지


module.exports = router;
