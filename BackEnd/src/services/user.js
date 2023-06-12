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
const findUserByEmail = async (email) => {
  return await User.findOne({ where: { email: email } });
};

/**
 *  id 검색 후 return
 * @param {number} id
 * @returns {object} { DB data }
 */
const findUserById = async (id) => {
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
 * email과 password를 받아 DB와 대조
 * @param {string} email
 * @param {string} password
 *
 * @returns {object} { access_token: string, refresh_token: string }
 */
const verifyLogin = async (email, password) => {
  return await findUserByEmail(email) // email 검색
    .then(async (user) => {
      if (user === null) {
        // email검색 실패(계정 없음)
        throw new Error('Unauthorized email.');
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // 비밀번호 틀림
        throw new Error('Incorrect password.');
      } else {
        // 비밀번호 맞음
        let access_token = await accessToken({ type: 'JWT', id: user.id });
        let refresh_token = await refreshToken({ type: 'JWT', id: user.id });
        return {
          access_token,
          refresh_token,
        };
      }
    });
};

/**
 * email, password, user_name 입력받아 DB와 대조
 * email, user_name이 중복되는지 확인
 * email, user_name, password가 비어있지 않은지 확인
 *
 * @param {string} user_name 사용자 이름
 * @param {string} email 이메일
 * @param {string} password 비밀번호
 *
 * @returns {boolean}
 */
const verifyRegister = async (email, password, user_name) => {
  return await User.findOne({ where: { [Op.or]: [{ email: email }, { user_name: user_name }] } }).then((data) => {
    let exist_data = JSON.stringify(data); // 객체(Object) -> JSON
    exist_data = JSON.parse(exist_data); // JSON -> 객체(Object)

    if (exist_data !== null) {
      // 찾는 데이터가 있을때
      if (exist_data.user_name === user_name) {
        throw new Error('Exist username.');
      } else {
        throw new Error('Exist email.');
      }
    } else {
      // 찾는 이메일, 닉네임이 없을 경우 (중복 X)
      if (!user_name) {
        throw new Error('Please input username.');
      } else if (!email) {
        throw new Error('Please input id.');
      } else if (!password) {
        throw new Error('Please input password.');
      } else {
        return true;
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
const updateUserInfo = async (user_id, email, user_name, file) => {
  const db_option = {
    user_name,
    email,
    ...(file && { profile: file.location }),
    // { profile: req.file.location } 객체가 req.file이 undefined이 아닌 경우에만 포함
  };
  let message = '';
  if (file && !file.mimetype.startsWith('image/')) {
    // mimetype이 image 형식이 아니라면 오류 처리 로직 실행
    throw new Error('Profile type must be only image.');
  }
  const user = await User.findByPk(user_id);
  if (user_name === user.user_name && email === user.email && file === undefined) {
    message = 'Profile no change.';
    return { message, user };
  }

  const check_username = await User.findOne({ where: { user_name } });
  if (check_username && check_username.user_name !== user.user_name) {
    throw new Error('The username is already in use.');
  }

  const check_email = await findUserByEmail(email);
  if (check_email && check_email.email !== user.email) {
    throw new Error('The email is already in use.');
  }

  return User.update(db_option, {
    where: { id: user_id },
  }).then(() => {
    return User.findOne({
      where: { id: user_id },
    }).then((data) => {
      message = 'Profile edit success.';
      return { message, data };
    });
  });
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  verifyLogin,
  verifyRegister,
  updateUserInfo,
};
