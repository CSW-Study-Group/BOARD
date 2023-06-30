'use strict';

const user = require('../services/user');

const { success, fail } = require('../functions/responseStatus');

const { startDate, endDate, todayDate } = require('../functions/common');

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
        code = 401;
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
 * - username, email, password 중 하나라도 입력되지 않았을 시, 400
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
    let result = await user.verifyRegister(email, password, user_name);
    if (result) {
      user.createUser(email, password, user_name);
      return success(res, 201, 'Register success.');
    }
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
 * 사용자의 id를 통해 프로필을 조회한다.
 * @param {number} id
 * @returns {object} { code: number, data: data }
 */
const getProfile = async (req, res) => {
  try {
    const data = await user.findUser('id', req.decoded.id, 0);
    return success(res, 200, 'No message', data);
  } catch (err) {
    let code;
    switch (err.message) {
      case 'Can not find profile.':
        code = 404;
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
const updateProfile = async (req, res) => {
  let { user_name, email } = req.body;
  let user_id = req.decoded.id;
  let data;
  try {
    let result = await user.updateUser(user_id, email, user_name, req.file);
    if (result.message === 'Profile no change.') {
      data = result.user;
    } else if (result.message === 'Profile edit success.') {
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
 * 사용자의 id로 오늘 출석 했는지를 조회합니다.
 *  @param {number} id
 * @returns {object} { code: number, message: string }
 * 출석했다면 400을 반환
 * 출석하지 않았다면 출석 체크를 하고 200반환
 */
const postAttendance = async (req, res) => {
  let user_id = req.decoded.id;
  const today_date = todayDate();

  try {
    const attendance = await user.findAttendance(user_id, today_date);

    if (attendance) {
      return fail(res, 400, 'Already checked attendance today.');
    }

    await user.createAttendance(user_id, today_date);
    return success(res, 201, 'Attendance check success.');
  } catch (err) {
    return fail(res, 500, err.message);
  }
};

/**
 * 사용자의 id로 출석 기록을 조회합니다.
 * @returns {object} { code: number, message: string, data: array }
 */
const getAttendance = async (req, res) => {
  try {
    const user_id = req.decoded.id;
    const start_date = startDate();
    const end_date = endDate();

    const attendance_dates = await user.findAttendanceDate(user_id, start_date, end_date);

    const data = attendance_dates.map((attendance) => {
      const date = new Date(attendance.attendance_date);
      return date.getDate();
    });

    return success(res, 200, 'No message.', data);
  } catch (err) {
    return fail(res, 500, err.message);
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
 * 출석 페이지를 렌더링한다.
 */
const viewAttend = (req, res) => {
  const start_date = startDate();
  const end_date = endDate();

  res.render('user/attendance', {
    start_date: start_date,
    end_date: end_date,
  });
};

module.exports = {
  postLogin,
  postRegister,
  getProfile,
  updateProfile,
  postAttendance,
  getAttendance,
  viewLogin,
  viewRegister,
  viewProfile,
  viewAttend,
};
