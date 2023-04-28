'use strict';

const { User, Post } = require('../utils/connect');

const model = require('../utils/connect');
const user_post = model.sequelize.models.user_post;

const { Op } = require('sequelize');

/**
 * page, limit 값을 받아, 해당하는 페이지의 게시글을 조회한다.
 * 검색어가 있을 경우, 검색어에 해당하는 게시글을 조회한다. (없을 경우, 모든 게시글을 조회)
 * 검색어: 제목, 내용, 작성자로 검색할 수 있다.
 */
const getBoard = async (where_user, where_content, limit, page) => {
  return await Post.findAndCountAll({
    include: [
      {
        model: User,
        required: true, // associated model이 존재하는 객체만을 Return
        attributes: ['user_name', 'profile'],
        where: where_user,
      },
    ],
    where: where_content,
    order: [['created_at', 'DESC']],
    limit: Math.max(1, parseInt(limit)),
    offset: (Math.max(1, parseInt(page)) - 1) * Math.max(1, parseInt(limit)),
  });
};

/**
 * 유저로부터, 게시글의 제목과 내용을 받아 글을 생성한다.
 */
const postBoard = async (title, content, user_id) => {
  return await Post.create({
    title: title,
    content: content,
    view: 0,
    user_id: user_id,
  });
};

/**
 * post_id에 해당하는 게시글을 조회하고, 조회수를 1 증가시킨다.
 */
const searchByPostId = async (post_id) => {
  const post = await Post.findOne({ where: { id: post_id } });
  if (post == null) {
    return null;
  }
  const data = await Post.findOne({
    include: [
      {
        model: User,
        attributes: ['user_name'],
        where: { id: post.user_id },
      },
    ],
    where: { id: post_id },
  });
  await Post.increment({ view: 1 }, { where: { id: post_id } });
  return data;
};

/**
 * 유저로부터, 게시글의 제목과 내용을 받아 글을 수정한다.
 */
const editPost = async (title, content, id) => {
  return await Post.update(
    {
      title: title,
      content: content,
      updated_at: new Date(),
    },
    {
      where: { id: id },
    },
  );
};

/**
 * 해당하는 id의 게시글을 삭제한다.
 */
const deletePost = async (id) => {
  return await Post.destroy({ where: { id: id } });
};

/**
 * 게시글에 대한 추천을 한다. (추천 O -> 추천 X) (추천 X -> 추천 O)
 */
const recommandBoard = async (user_id, content_id) => {
  const userPost = await user_post.findOne({
    where: { [Op.and]: [{ user_id: user_id }, { post_id: content_id }] },
  });

  if (userPost !== null) {
    // 추천 취소
    const post = await Post.findOne({
      attributes: ['recommand'],
      where: { id: content_id },
    });
    await Post.update({ recommand: --post.recommand }, { where: { id: content_id } });
    await user_post.destroy({
      where: { [Op.and]: [{ user_id: user_id }, { post_id: content_id }] },
    });
    return { code: 200, message: 'delete', data: post };
  } else {
    // 추천
    const post = await Post.findOne({
      attributes: ['recommand'],
      where: { id: content_id },
    });
    await Post.update({ recommand: ++post.recommand }, { where: { id: content_id } });
    await user_post.create({ user_id: user_id, post_id: content_id });
    return { code: 200, message: 'create', data: post };
  }
};

/**
 * 게시글 작성자인지 확인한다.
 */
const authCheckPost = async (content_id) => {
  return await Post.findOne({
    attributes: ['user_id'],
    where: { id: content_id },
  });
};

/**
 * 해당 유저의 게시글 추천 여부를 확인한다.
 */
const recommandCheckBoard = async (user_id, content_id) => {
  return await user_post.findOne({
    where: { [Op.and]: [{ user_id: user_id }, { post_id: content_id }] },
  });
};

/**
 * 게시글 수정 페이지를 렌더링하면서, 해당 게시글의 정보를 함께 전달한다.
 */
const editView = async (id) => {
  return await Post.findOne({ where: { id: id } });
};

module.exports = {
  getBoard,
  postBoard,
  searchByPostId,
  editPost,
  deletePost,
  recommandBoard,
  authCheckPost,
  recommandCheckBoard,
  editView,
};
