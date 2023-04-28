'use strict';

const { auth } = require('../middleware/verifyJWT');

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/board');

const { validator } = require('../middleware/validator');
const { check } = require('express-validator');

// methods for board
router.get('/', ctrl.boardGet);
router.post(
  '/',
  [
    auth,
    check('title').notEmpty().withMessage('Title is required.'),
    check('content').notEmpty().withMessage('Content is required.'),
    validator,
  ],
  ctrl.boardPost,
);

router.get('/:id', [check('id').isInt().withMessage('Post ID must be a number.'), validator], ctrl.boardGetByPostId);
router.delete('/:id', ctrl.boardDeleteByPostId);
router.patch(
  '/:id',
  [
    auth,
    check('title').notEmpty().withMessage('Title is required.'),
    check('content').notEmpty().withMessage('Content is required.'),
    validator,
  ],
  ctrl.boardEditByPostId,
);

router.post('/:id/recommand', auth, ctrl.boardRecommand);

// check auth, recommand status
router.get('/:id/auth', auth, ctrl.postAuthCheck);
router.get('/:id/recommand', auth, ctrl.boardRecommandCheck);

// rendering page
router.get('/post/new', ctrl.postView);
router.get('/:id/edit', ctrl.editViewByPostId);

module.exports = router;