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
  auth,
  [
    check('title').notEmpty().withMessage('Title is required.'),
    check('content').notEmpty().withMessage('Content is required.'),
    validator,
  ],
  ctrl.boardPost,
);

router.get('/:id', [check('id').isInt().withMessage('Post ID must be a number.'), validator], ctrl.boardGetByPostId);
router.delete('/:id', [check('id').isInt().withMessage('Post ID must be a number.'), validator], ctrl.boardDeleteByPostId);
router.patch(
  '/:id',
  auth,
  [
    check('id').isInt().withMessage('Post ID must be a number.'),
    check('title').notEmpty().withMessage('Title is required.'),
    check('content').notEmpty().withMessage('Content is required.'),
    validator,
  ],
  ctrl.boardEditByPostId,
);

router.post('/:id/recommand', auth, [check('id').isInt().withMessage('Post ID must be a number.'), validator], ctrl.boardRecommand);

// methods for board comment
router.post('/:id/comment', auth, [check('comment').notEmpty().withMessage('Comment is required.'), validator], ctrl.boardCommentPost);
router.delete('/:id/comment/:comment_id', auth, ctrl.boardCommentDelete);
router.get('/:id/comment/:comment_page', auth, ctrl.boardCommentMore);

// check auth, recommand status
router.get('/:id/auth', auth,[check('id').isInt().withMessage('Post ID must be a number.'), validator], ctrl.postAuthCheck);
router.get('/:id/recommand', auth, [check('id').isInt().withMessage('Post ID must be a number.'), validator], ctrl.boardRecommandCheck);

// rendering page
router.get('/post/new', ctrl.postView);
router.get('/:id/edit', [check('id').isInt().withMessage('Post ID must be a number.'), validator], ctrl.editViewByPostId);

module.exports = router;
