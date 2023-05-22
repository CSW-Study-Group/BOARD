'use strict';

const { Attendance } = require('../utils/connect');

const { success, fail } = require('../functions/responseStatus');

const user = require('../services/user');

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
      let access_token = data.access_token;
      let refresh_token = data.refresh_token;
      return res.status(200).json({
        message: 'Authorize success.',
        code: 200,
        access_token,
        refresh_token,
      });
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
    return res.status(code).json({ code: code, message: err.message });
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
        return res.status(200).json({
          code: 200,
        });
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
    return res.status(code).json({ code: code, message: err.message });
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
      return res.status(200).json({ code: 200, data: data });
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
    return res.status(code).json({ code: code, message: err.message });
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
    return res.status(200).json({ code: 200, message: result.message, data: data });
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
    return res.status(code).json({ code: code, message: err.message });
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

const attendCheck = async (req, res) => {
  let user_id = req.decoded.id;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const attendance = await Attendance.findOne({
      where: { User_id: user_id, attendanceDate: today },
    });

    if (attendance) {
      return fail(res, 400, 'POST', req.ip, '오늘은 이미 출석체크를 하셨습니다.');
    }

    await Attendance.create({ user_id: user_id, attendanceDate: today });
    return success(res, 200, 'POST', req.ip, '출석이 완료되었습니다.');
  } catch (err) {
    return fail(res, 500, 'POST', req.ip, `${err.message}`);
  }
};

module.exports = {
  postLogin,
  postRegister,
  getProfile,
  editProfile,
  viewLogin,
  viewRegister,
  viewProfile,
  attendCheck,
};
