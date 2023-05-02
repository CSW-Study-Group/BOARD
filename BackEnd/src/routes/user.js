'use strict';

const { auth } = require('../middleware/verifyJWT');
const { issuanceToken } = require('../functions/signJWT');

const express = require('express');
const router = express.Router();

const { validator } = require('../middleware/validator');
const { check } = require('express-validator');

const ctrl = require('../controllers/user');

// methods for user
router.post('/login', [
    check('email').isEmail(),
    check('password').notEmpty(),
    validator,
], ctrl.postLogin);
router.post('/register', [
    check('user_name').notEmpty(),
    check('email').isEmail(),
    check('password').isLength({ min: 2 }),
    validator,
], ctrl.postRegister);

router.get('/profile', auth, ctrl.getProfile);
router.patch('/profile', auth, ctrl.editImage, ctrl.editProfile);

// token refresh
router.get('/token/refresh', issuanceToken);

// rendering page
router.get('/login', ctrl.viewLogin);
router.get('/register', ctrl.viewRegister);
router.get('/profile/output/', ctrl.viewProfile);

module.exports = router;
