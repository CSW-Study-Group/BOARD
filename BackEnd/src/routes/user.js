'use strict';

const { auth } = require('../middleware/verifyJWT');
const { issuanceToken } = require('../functions/signJWT');

const express = require('express');
const router = express.Router();

const { editImage } = require('../middleware/multer.js');
const ctrl = require('../controllers/user');

// methods for user
router.post('/login', ctrl.postLogin);
router.post('/register', ctrl.postRegister);

router.get('/profile', auth, ctrl.getProfile);
router.patch('/profile', auth, editImage, ctrl.editProfile);

// token refresh
router.get('/token/refresh', issuanceToken);

// rendering page
router.get('/login', ctrl.viewLogin);
router.get('/register', ctrl.viewRegister);
router.get('/profile/output/', ctrl.viewProfile);

module.exports = router;
