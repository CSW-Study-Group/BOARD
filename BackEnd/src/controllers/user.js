'use strict';

const user = require('../services/user');

/**
 * 제공된 이메일과 비밀번호로 로그인을 시도하고, 성공하면 토큰을 발급한다.
 *
 * @param {string} email 이메일
 * @param {string} password 비밀번호
 *
 * @returns {object} { code: number, message: string, access_token: string, refresh_token: string }
 */
const loginPost = async (req, res) => {
  let { email, password } = req.body;
  try {
    await user.loginCheck(email, password).then((result) => {
      switch (result.message) {
        case 'Unauthorized email.': {
          return res.status(405).json({
            message: result.message,
            code: 405,
          });
        }
        case 'Incorrect password.': {
          return res.status(405).json({
            message: result.message,
            code: 405,
          });
        }
        case 'Authorize success.': {
          let access_token = result.access_token;
          let refresh_token = result.refresh_token;
          return res.status(200).json({
            message: result.message,
            code: 200,
            access_token,
            refresh_token,
          });
        }
        default:
          console.log('service error'); // 로그로 바꾸기 필요
          break;
      }
    });
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message });
  }
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
 * @returns {object} { code: number, message: string }
 */
const registerPost = async (req, res) => {
  let { email, password, user_name } = req.body;

  try {
    await user.registerCheck(email, password, user_name).then((message) => {
      switch (message) {
        case 'Exist username.': {
          return res.status(409).json({
            message: message,
            code: 409,
          });
        }
        case 'Exist email.': {
          return res.status(409).json({
            message: message,
            code: 409,
          });
        }
        case 'Please input username.': {
          return res.status(405).json({
            message: message,
            code: 405,
          });
        }
        case 'Please input id.': {
          return res.status(405).json({
            message: message, // ID가 아니라 email로 바꾸는 건?
            code: 405,
          });
        }
        case 'Please input password.': {
          return res.status(405).json({
            message: message,
            code: 405,
          });
        }
        case 'register pass': {
          user.createUser(email, password, user_name);
          return res.status(200).json({
            code: 200,
          });
        }
        default:
          console.log('service error'); // 로그로 바꾸기 필요
          break;
      }
    });
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};

/**
 * 사용자의 id를 통해 프로필을 조회한다.
 */
const profileGet = async (req, res) => {
  user.idSearch(req.decoded.id).then((data) => {
    return res.status(200).json({ code: 200, data: data });
  });
};

/**
 * 사용자에게, username, email을 입력받아 프로필을 편집합니다.
 * @param {string} user_name
 * @param {string} email
 *
 * @returns {object} { code: number, message: string }
 *  - username, email이 다른 사용자가 사용하고 있을 시, 409 반환
 *  - username, email 변동없을 시 편집 정상 수행
 */
const profileEdit = async (req, res) => {
  let { user_name, email } = req.body;
  let user_id = req.decoded.id;

  try {
    let result = await user.newprofileEdit(user_id, email, user_name, req.file);
    switch (result.message) {
      case 'Profile type must be only image.': {
        return res.status(400).json({
          message: result.message,
          code: 400,
        });
      }
      case 'Profile no change.': {
        return res.status(200).json({
          message: result.message,
          code: 200,
          data: result.user,
        });
      }
      case 'The username is already in use.': {
        return res.status(409).json({
          message: result.message,
          code: 409,
        });
      }
      case 'The email is already in use.': {
        return res.status(409).json({
          message: result.message,
          code: 409,
        });
      }
      case 'Profile Edit Success!': {
        return res.status(200).json({
          message: result.message,
          code: 200,
          data: result.data,
        });
      }
      default:
        console.log('service error'); // 로그로 바꾸기 필요
        break;
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      code: 500,
    });
  }
};

/**
 * 로그인 페이지를 렌더링한다.
 */
const loginView = (req, res) => {
  res.render('user/login');
};

/**
 * 회원가입 페이지를 렌더링한다.
 */
const registerView = (req, res) => {
  res.render('user/register');
};

/**
 * 프로필 페이지를 렌더링한다.
 */
const profileView = (req, res) => {
  res.render('user/profile');
};

module.exports = {
  loginPost,
  registerPost,
  profileGet,
  profileEdit,
  loginView,
  registerView,
  profileView,
};
