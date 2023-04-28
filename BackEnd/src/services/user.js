'use strict';

const { User } = require('../utils/connect');
const { Op } = require('sequelize');

const { accessToken, refreshToken } = require('../functions/signJWT');
const bcrypt = require('bcrypt');

/**
 * email 검색 후 return
 * @param {string} email
 * @returns {object} { DB data }
 */
const emailSearch = async (email) => {
  return await User.findOne({ where: { email: email } });
};

/**
 *  id 검색 후 return
 * @param {number} id
 * @returns {object} { DB data }
 */
const idSearch = async (id) => {
  return await User.findOne({ where: { id: id } });
};

/**
 * password 암호화 후 새로운 user 생성
 * @param {string} email
 * @param {string} password
 * @param {string} user_name
 */
const createUser = async (email, password, user_name) => {
  await bcrypt.hash(password, 10).then((encrypted_pw) => {
    User.create({
      user_name: user_name,
      email: email,
      password: encrypted_pw,
    });
  });
};

/**
 * email과 password를 받아 DB와 대조.
 * @param {string} email
 * @param {string} password
 *
 * @returns {object} { message: string, access_token: string, refresh_token: string }
 */
const loginCheck = async (email, password) => {
  let message = '';
  return await emailSearch(email) // email 검색
    .then(async (user) => {
      if (user === null) {
        // email검색 실패(계정 없음)
        message = 'Unauthorized email.';
        return { message };
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // 비밀번호 틀림
        message = 'Incorrect password.';
        return { message };
      } else {
        // 비밀번호 맞음
        let access_token = await accessToken({ type: 'JWT', id: user.id });
        let refresh_token = await refreshToken({ type: 'JWT', id: user.id });
        message = 'Authorize success.';
        return {
          message,
          access_token,
          refresh_token,
        };
      }
    });
};

/**
 * 사용자에게, username, email, password를 입력받아 회원가입을 시도한다.
 * - username, email이 다른 사용자가 사용하고 있을 시, 409
 * - username, email, password 중 하나라도 입력되지 않았을 시, 405
 *
 * @param {string} user_name 사용자 이름
 * @param {string} email 이메일
 * @param {string} password 비밀번호
 *
 * @returns {string} message
 */
const registerCheck = async (email, password, user_name) => {
  return await User.findOne({ where: { [Op.or]: [{ email: email }, { user_name: user_name }] } }).then((data) => {
    let exist_data = JSON.stringify(data); // 객체(Object) -> JSON
    exist_data = JSON.parse(exist_data); // JSON -> 객체(Object)

    if (exist_data !== null) {
      // 찾는 데이터가 있을때
      if (exist_data.user_name === user_name) {
        return 'Exist username.';
      } else {
        return 'Exist email.';
      }
    } else {
      // 찾는 이메일, 닉네임이 없을 경우 (중복 X)
      if (user_name === '') {
        return 'Please input username.';
      } else if (email === '') {
        return 'Please input id.';
      } else if (password === '') {
        return 'Please input password.';
      } else {
        return 'register pass';
      }
    }
  });
};

/**
 * 사용자에게, username, email을 입력받아 프로필을 편집합니다.
 * @param {number} user_id
 * @param {string} email
 * @param {string} user_name
 * @param {any} file
 *
 * @returns {Object} { message: string, user | data : DBdata }
 */
const editProfile = async (user_id, email, user_name, file) => {
  const db_option = {
    user_name,
    email,
    ...(file && { profile: file.location }),
    // { profile: req.file.location } 객체가 req.file이 undefined이 아닌 경우에만 포함
  };
  let message = '';
  if (file && !file.mimetype.startsWith('image/')) {
    // mimetype이 image 형식이 아니라면 오류 처리 로직 실행
    message = 'Profile type must be only image.';
    return { message };
  }
  const user = await User.findByPk(user_id);
  if (user_name === user.user_name && email === user.email && file === undefined) {
    message = 'Profile no change.';
    return { message, user };
  }

  const check_username = await User.findOne({ where: { user_name } });
  if (check_username && check_username.user_name !== user.user_name) {
    message = 'The username is already in use.';
    return { message };
  }

  const check_email = await emailSearch(email);
  if (check_email && check_email.email !== user.email) {
    message = 'The email is already in use.';
    return { message };
  }

  return User.update(db_option, {
    where: { id: user_id },
  }).then(() => {
    return User.findOne({
      where: { id: user_id },
    }).then((data) => {
      message = 'Profile Edit Success!';
      return { message, data };
    });
  });
};

module.exports = {
  loginCheck,
  registerCheck,
  createUser,
  idSearch,
  editProfile,
};
