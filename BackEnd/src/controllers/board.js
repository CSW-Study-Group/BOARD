'use strict';

const board = require('../services/board');
const { Op } = require('sequelize');

const { success, fail } = require('../functions/responseStatus');

const { createSearchQuery } = require('../functions/query');

/**
 * page, limit 값을 받아, 해당하는 페이지의 게시글을 조회한다.
 * 검색어가 있을 경우, 검색어에 해당하는 게시글을 조회한다. (없을 경우, 모든 게시글을 조회)
 * 검색어: 제목, 내용, 작성자로 검색할 수 있다.
 *
 * limit 값이 5, 10, 20이 아닐 경우, 5로 설정하고, 에러 메시지를 반환한다.
 * page 값이 1000 이상일 경우, 1로 설정하고, 에러 메시지를 반환한다.
 *
 * DB에서 조회한 글의 수보다 page * limit 값이 클 경우, page 값을 마지막 페이지로 설정한다.
 *
 * @returns {Object} 게시글 정보
 */
const boardGet = async (req, res) => {
  let { page, limit, searchType, searchText } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  let where_content = null,
    where_user = null;

  const rendering = (res, posts, message, currentPage = 1, maxPage = 1, limit = 5) => {
    return res.render('post/index', {
      posts: posts,
      currentPage: currentPage,
      maxPage: maxPage,
      limit: limit,
      searchType: searchType,
      searchText: searchText,
      error: message,
    });
  };

  page = !isNaN(page) ? page : 1;
  if (page >= 1000) {
    return rendering(res, [], 'Page can only be a number less than 1000.');
  }

  limit = !isNaN(limit) ? limit : 10;
  if ([5, 10, 20].indexOf(limit) === -1) {
    return rendering(res, [], 'Limit can only be 5, 10, 20.');
  }

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
      switch (key[0]) {
        case 'title':
          where_content = { title: { [Op.like]: `%${searchQuery[0].title}%` } };
          break;
        case 'body':
          where_content = { content: { [Op.like]: `%${searchQuery[0].body}%` } };
          break;
        case 'user_name':
          where_user = { user_name: searchQuery[0].user_name };
          break;
      }
    }

    const post_count = await board.countPost();
    if (page * limit > post_count) page = post_count / limit; // 마지막 페이지
    if(!Number.isInteger(page)) page = parseInt(page) + 1;

    await board.getBoard(where_user, where_content, limit, page).then((data) => {
      return rendering(res, data.rows, null, page, Math.ceil(data.count / Math.max(1, limit)), limit);
    });
  } catch (err) {
    return fail(res, 500, err.message);
  }
};

/**
 * post_id에 해당하는 게시글을 조회하고, 조회수를 1 증가시킨다.
 *
 * @returns {Object} 게시글 정보
 */
const boardGetByPostId = async (req, res) => {
  const { id: post_id } = req.params;

  try {
    let data = await board.searchByPostId(post_id);

    let comments = await board.searchCommentByPostId(post_id, 5, 1);
    res.render('post/read', { post: data, count: comments.count, comments: comments.rows, more: comments.more });
  } catch (err) {
    if (err.message === 'No data.') {
      return fail(res, 404, err.message);
    } else {
      return fail(res, 500, err.message);
    }
  }
};

/**
 * 유저로부터, 게시글의 제목과 내용을 받아 글을 생성한다.
 */
const boardPost = (req, res) => {
  const { title, content } = req.body;
  const user_id = req.decoded.id;

  try {
    board.postBoard(title, content, user_id).then(() => {
      return success(res, 200, 'Post created success.');
    });
  } catch (err) {
    return fail(res, 500, err.message);
  }
};

/**
 * 유저로부터, 게시글의 제목과 내용을 받아 글을 수정한다.
 */
const boardUpdateByPostId = (req, res) => {
  const { title, content } = req.body;
  const { id: post_id } = req.params;
  try {
    board.updatePost(title, content, post_id).then(() => {
      return success(res, 200, 'Post updated success.');
    });
  } catch (err) {
    return fail(res, 500, err.message);
  }
};

/**
 * 해당하는 id의 게시글을 삭제한다.
 */
const boardDeleteByPostId = async (req, res) => {
  const { id: post_id } = req.params;
  try {
    await board.deletePost(post_id);
    return success(res, 200, 'Post deleted success.');
  } catch (err) {
    return fail(res, 500, err.message);
  }
};

/**
 * 게시글에 대한 추천을 한다. (추천 O -> 추천 X) (추천 X -> 추천 O)
 */
const boardRecommand = async (req, res) => {
  let user_id = req.decoded.id;
  let content_id = req.params.id;

  try {
    const result = await board.recommandBoard(user_id, content_id);
    return success(res, 200, result.message, result.data);
  } catch (err) {
    return fail(res, 500, err.message);
  }
};

/**
 * 유저로부터, 댓글 내용을 받아 생성한다.
 */
const boardCommentPost = (req, res) => {
  const { comment } = req.body;
  const user_id = req.decoded.id;
  let content_id = req.params.id;

  try {
    board.commentPost(comment, user_id, content_id).then(() => {
      return success(res, 200, 'Comment created success.');
    });
  } catch (err) {
    return fail(res, 500, err.message);
  }
};

/**
 * 댓글 id와 유저 id를 받아서 댓글을 삭제한다.
 */
const boardCommentDelete = async (req, res) => {
  const comment_id = req.params.comment_id;
  const user_id = req.decoded.id;

  try {
    await board.commentDelete(comment_id, user_id);
    return success(res, 200, 'Comment deleted success.');
  } catch (err) {
    if(err.message === 'unauthorized') {
      return fail(res, 401, err.message);
    } else {
      return fail(res, 500, err.message);
    }
  }
};

/**
 * 댓글 더보기
 */
const boardCommentMore = async (req, res) => {
  const { id: post_id, comment_page: comment_page } = req.params;

  try {
    const comments = await board.searchCommentByPostId(post_id, 5, comment_page);
    return success(res, 200, 'Bringing up comments success.', comments);
  } catch (err) {
    if (err.message === 'Page can only be a number less than 1000.') {
      return fail(res, 400, err.message);
    } else {
      return fail(res, 500, err.message);
    }
  }
};

/**
 * 게시글 작성자인지 확인한다. (작성자일 경우, 200, 작성자가 아닐 경우, 401)
 */
const postAuthCheck = (req, res) => {
  let user_id = req.decoded.id;
  let content_id = req.params.id;

  try {
    board.authCheckPost(content_id).then((data) => {
      if (user_id === data.user_id) {
        return success(res, 200, 'authorized');
      } else {
        return success(res, 401, 'unauthorized');
      }
    });
  } catch (err) {
    return fail(res, 500, err.message);
  }
};

/**
 * 해당 유저의 게시글 추천 여부를 확인한다. (추천 O, 200, 추천 X, 200)
 */
const boardRecommandCheck = (req, res) => {
  let user_id = req.decoded.id;
  let content_id = req.params.id;

  try {
    board.recommandCheckBoard(user_id, content_id).then((data) => {
      if (data !== null) {
        // 추천 O
        return success(res, 200, 'created');
      } else {
        // 추천 X
        return success(res, 200, 'deleted');
      }
    });
  } catch (err) {
    return fail(res, 500, err.message);
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
const updateViewByPostId = async (req, res) => {
  const { id: post_id } = req.params;

  try {
    let data = await board.searchByPostId(post_id);
    res.render('post/update', { post: data });
  } catch (err) {
    return fail(res, 500, err.message);
  }
};

module.exports = {
  boardGet,
  boardGetByPostId,
  boardPost,
  boardUpdateByPostId,
  boardDeleteByPostId,
  boardRecommand,
  boardCommentPost,
  boardCommentDelete,
  boardCommentMore,
  postAuthCheck,
  boardRecommandCheck,
  postView,
  updateViewByPostId,
};