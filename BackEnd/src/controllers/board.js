'use strict';

const board = require('../services/board');

const {
  getBoard,
  postBoard,
  searchByPostId,
  editPost,
  deletePost,
  recommandBoard,
  authCheckPost,
  recommandCheckBoard,
  editView,
} = board;

var { createSearchQuery } = require('../functions/query');

const { Op } = require('sequelize');

/**
 * page, limit 값을 받아, 해당하는 페이지의 게시글을 조회한다.
 * 검색어가 있을 경우, 검색어에 해당하는 게시글을 조회한다. (없을 경우, 모든 게시글을 조회)
 * 검색어: 제목, 내용, 작성자로 검색할 수 있다.
 *
 * @returns {Object} 게시글 정보
 */
const boardGet = async (req, res) => {
  let { page, limit } = req.query;
  let where_content = null,
    where_user = null;

  page = !isNaN(page) ? page : 1;
  limit = !isNaN(limit) ? limit : 10;

  try {
    let searchQuery = await createSearchQuery(req.query);
    let key = searchQuery.length > 0 ? Object.keys(searchQuery[0]) : undefined;

    if (searchQuery.length === 2) {
      where_content = {
        [Op.or]: [
          { title: { [Op.like]: `%${searchQuery[0].title}%` } },
          { content: { [Op.like]: `%${searchQuery[1].body}%` } },
        ],
      };
    } else if (searchQuery.length === 1) {
      if (key[0] === 'title') {
        where_content = { title: { [Op.like]: `%${searchQuery[0].title}%` } };
      } else if (key[0] === 'body') {
        where_content = { content: { [Op.like]: `%${searchQuery[0].body}%` } };
      } else if (key[0] === 'user_name') {
        where_user = { user_name: searchQuery[0].user_name };
      }
    }

    await getBoard(where_user, where_content, limit, page).then((data) => {
      res.render('post/index', {
        posts: data.rows,
        currentPage: page,
        maxPage: Math.ceil(data.count / Math.max(1, parseInt(limit))),
        limit: limit,
        searchType: req.query.searchType,
        searchText: req.query.searchText,
      });
    });
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};

/**
 * post_id에 해당하는 게시글을 조회하고, 조회수를 1 증가시킨다.
 *
 * @returns {Object} 게시글 정보
 */
const boardGetByPostId = (req, res) => {
  const { id: post_id } = req.params;

  try {
    searchByPostId(post_id, res);
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};

/**
 * 유저로부터, 게시글의 제목과 내용을 받아 글을 생성한다.
 */
const boardPost = (req, res) => {
  const { title, content } = req.body;
  const user_id = req.decoded.id;

  try {
    postBoard(title, content, user_id).then(() => {
      return res.status(200).json({ code: 200 });
    });
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};

/**
 * 유저로부터, 게시글의 제목과 내용을 받아 글을 수정한다.
 */
const boardEditByPostId = (req, res) => {
  const { title, content, id } = req.body;
  try {
    editPost(title, content, id).then(() => {
      return res.status(200).json({ code: 200 });
    });
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};

/**
 * 해당하는 id의 게시글을 삭제한다.
 */
const boardDeleteByPostId = (req, res) => {
  const { id: id } = req.params;
  try {
    deletePost(id).then(() => {
      res.redirect('/board' + res.locals.getPostQueryString(false, { page: 1, searchText: '' }));
    });
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};

/**
 * 게시글에 대한 추천을 한다. (추천 O -> 추천 X) (추천 X -> 추천 O)
 */
const boardRecommand = (req, res) => {
  let user_id = req.decoded.id;
  let content_id = req.params.id;

  try {
    recommandBoard(user_id, content_id, res);
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};

/**
 * 게시글 작성자인지 확인한다. (작성자일 경우, 200, 작성자가 아닐 경우, 401)
 */
const postAuthCheck = (req, res) => {
  let user_id = req.decoded.id;
  let content_id = req.params.id;

  try {
    authCheckPost(content_id).then((data) => {
      if (user_id === data.user_id) {
        return res.status(200).json({ code: 200, message: 'authorized' });
      } else {
        return res.status(401).json({ code: 401, message: 'unauthorized' });
      }
    });
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};

/**
 * 해당 유저의 게시글 추천 여부를 확인한다. (추천 O, 200, 추천 X, 200)
 */
const boardRecommandCheck = (req, res) => {
  let user_id = req.decoded.id;
  let content_id = req.params.id;

  try {
    recommandCheckBoard(user_id, content_id).then((data) => {
      if (data !== null) {
        // 추천 O
        return res.status(200).json({
          code: 200,
          message: 'created',
        });
      } else {
        // 추천 X
        return res.status(200).json({
          code: 200,
          message: 'deleted',
        });
      }
    });
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};

/**
 * 게시글 작성 페이지를 렌더링한다.
 */
const postView = (req, res) => {
  res.render('post/create');
};

/**
 * 게시글 수정 페이지를 렌더링하면서, 해당 게시글의 정보를 함께 전달한다.
 */
const editViewByPostId = async (req, res) => {
  const { id: id } = req.params;
  let data = await editView(id);
  res.render('post/update', { post: data });
};

module.exports = {
  boardGet,
  boardGetByPostId,
  boardPost,
  boardEditByPostId,
  boardDeleteByPostId,
  boardRecommand,
  postAuthCheck,
  boardRecommandCheck,
  postView,
  editViewByPostId,
};
