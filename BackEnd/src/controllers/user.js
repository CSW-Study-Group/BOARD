'use strict';

const user = require('../services/user');

const { success, fail } = require('../functions/responseStatus');

/**
 * 제공된 이메일과 비밀번호로 로그인을 시도하고, 성공하면 토큰을 발급한다.
 *
 * @param {string} email 이메일
 * @param {string} password 비밀번호
 *
 * @returns {object} { code: number, message: string, access_token: string, refresh_token: string }
 */
const postLogin = async (req, res) => {
  let { email, password } = req.body;
  try {
    await user.verifyLogin(email, password).then((data) => {
      let token = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      };
      return success(res, 200, 'Authorize success.', token);
    });
  } catch (err) {
    let code;
    switch (err.message) {
      case 'Unauthorized email.':
      case 'Incorrect password.':
        code = 405;
        break;
      default:
        code = 500;
        break;
    }
    return fail(res, code, err.message);
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
const postRegister = async (req, res) => {
  let { email, password, user_name } = req.body;

  try {
    await user.verifyRegister(email, password, user_name).then((result) => {
      if (result) {
        user.createUser(email, password, user_name);
        return success(res, 200, 'Register success.');
      } else {
        throw new Error('Services error.');
      }
    });
  } catch (err) {
    let code;
    switch (err.message) {
      case 'Exist username.':
      case 'Exist email.':
        code = 409;
        break;
      case 'Please input username.':
      case 'Please input id.':
      case 'Please input password.':
        code = 405;
        break;
      default:
        code = 500;
        break;
    }
    return fail(res, code, err.message);
  }
};

/**
 * 사용자의 id를 통해 프로필을 조회한다.
 * @param {number} id
 * @returns {object} { code: number, data: data }
 */
const getProfile = async (req, res) => {
  try {
    user.findUserById(req.decoded.id).then((data) => {
      if (!data) {
        throw new Error('Can not find profile.');
      }
      return success(res, 200, 'No message', data);
    });
  } catch (err) {
    let code;
    switch (err.message) {
      case 'Can not find profile.':
        code = 400;
        break;
      default:
        code = 500;
        break;
    }
    return fail(res, code, err.message);
  }
};

/**
 * 사용자에게, username, email을 입력받아 프로필을 편집합니다.
 * @param {string} user_name
 * @param {string} email
 *
 * @returns {object} { code: number, message: string, data: object }
 *  - username, email이 다른 사용자가 사용하고 있을 시, 409 반환
 *  - username, email 변동없을 시 편집 정상 수행
 */
const editProfile = async (req, res) => {
  let { user_name, email } = req.body;
  let user_id = req.decoded.id;
  let data;
  try {
    let result = await user.updateUserInfo(user_id, email, user_name, req.file);
    if (result.message === 'Profile no change.') {
      data = result.user;
    } else if (result.message === 'Profile Edit Success!') {
      data = result.data;
    }
    return success(res, 200, result.message, data);
  } catch (err) {
    let code;
    switch (err.message) {
      case 'Profile type must be only image.':
        code = 400;
        break;
      case 'The username is already in use.':
      case 'The email is already in use.':
        code = 409;
        break;
      default:
        code = 500;
        break;
    }
    return fail(res, code, err.message);
  }
};

/**
 * 현재 비밀번호, 새 비밀번호, 비밀번호 확인 입력받아 비밀번호 변경
 * @param {string} confirm_password 사용자가 입력한 기존 비밀번호
 * @param {string} new_password 새 비밀번호
 */
const editPassword = async (req, res) => {
  let { confirm_password, new_password } = req.body;
  let user_id = req.decoded.id;
  try {
    let result = await user.updatePassword(user_id, confirm_password, new_password);
    if (result.message === 'Password changed') {
      let data = result.data;
      return success(res, 200, result.message, data);
    } else {
      console.log('else: ' + result.message);
      throw new Error('Services error.');
    }
  } catch (err) {
    let code;
    switch (err.message) {
      case 'Can not find profile.':
        code = 400; //에러코드 
        break;
      case 'Incorrect password.':
        code = 422; //에러코드 
        break;
      default:
        code = 500;
        break;
    }
    return fail(res, code, err.message);
  }
};

/**
 * 로그인 페이지를 렌더링한다.
 */
const viewLogin = (req, res) => {
  res.render('user/login');
};

/**
 * 회원가입 페이지를 렌더링한다.
 */
const viewRegister = (req, res) => {
  res.render('user/register');
};

/**
 * 프로필 페이지를 렌더링한다.
 */
const viewProfile = (req, res) => {
  res.render('user/profile');
};

/**
 * 비밀번호 변경페이지를 렌더링한다.
 */
const viewChangePassword = (req, res) => {
  res.render('user/changePassword');
};

module.exports = {
  postLogin,
  postRegister,
  getProfile,
  editProfile,
  editPassword,
  viewLogin,
  viewRegister,
  viewProfile,
  viewChangePassword,
};
