'use strict';

const { User, Attendance } = require('../utils/connect');
const { Op } = require('sequelize');

const { accessToken, refreshToken, oneTimeToken } = require('../functions/signJWT');
const bcrypt = require('bcrypt');
const random = require('crypto');

const cache = require('memory-cache');
const logger = require('../functions/winston');

/**
 * 사용자 검색 후 return
 * @param {string} field 검색할 필드명 ('email' 또는 'id')
 * @param {string|number} value 검색할 값
 * @param {number} locate 함수를 사용할 위치 0 = ctrl, 1 = service
 * @returns {object} { DB data }
 */
const findUser = async (field, value, locate = 1) => {
  let where = {};

  if (field === 'email') {
    where = { email: value };
  } else if (field === 'id') {
    where = { id: value };
  }

  const user = await User.findOne({ where: where });
  if (!user && locate === 0) {
    throw new Error('Can not find profile.');
  } else if (!user && locate === 1) {
    return null;
  } else {
    return user;
  }
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
 * 사용자에게, username, email을 입력받아 프로필을 편집합니다.
 * @param {number} user_id
 * @param {string} email
 * @param {string} user_name
 * @param {any} file
 *
 * @returns {Object} { message: string, user | data : DBdata }
 */
const updateUser = async (user_id, email, user_name, file) => {
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
  const user = await User.findByPk(user_id); // findeUser로 바꾸는지?
  if (user_name === user.user_name && email === user.email && file === undefined) {
    message = 'Profile no change.';
    return { message, user };
  }

  const check_username = await User.findOne({ where: { user_name } });
  if (check_username && check_username.user_name !== user.user_name) {
    throw new Error('The username is already in use.');
  }

  const check_email = await findUser('email', email);
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

/**
 * email과 password를 받아 DB와 대조
 * @param {string} email
 * @param {string} password
 *
 * @returns {object} { access_token: string, refresh_token: string }
 */
const verifyLogin = async (email, password) => {
  return await findUser('email', email) // email 검색
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
 * 사용자의 id와 오늘 날짜로 출석 기록을 검색합니다.
 * @param {number} user_id - 사용자 id
 * @param {string} today - 오늘 날짜
 * @returns {object} - { DB data }
 */
const findAttendance = async (user_id, today) => {
  return await Attendance.findOne({
    where: { User_id: user_id, attendance_date: today },
  });
};

/**
 * 사용자의 id와 오늘 날짜로 출석 기록을 생성합니다.
 * @param {number} user_id - 사용자 id
 * @param {string} today_date - 오늘 날짜
 */
const createAttendance = async (user_id, today_date) => {
  await Attendance.create({ user_id: user_id, attendance_date: today_date });
};

/**
 * 사용자의 id, 시작 날짜, 종료 날짜로 그 사이의 출석 날짜를 검색합니다.
 * @param {number} user_id - 사용자 id
 * @param {string} start_date - 시작 날짜
 * @param {string} end_date - 종료 날짜
 * @returns {object} - { DB data }
 */
const findAttendanceDate = async (user_id, start_date, end_date) => {
  return await Attendance.findAll({
    where: {
      user_id: user_id,
      attendance_date: {
        [Op.between]: [start_date, end_date],
      },
    },
    attributes: ['attendance_date'],
  });
};

/**
 *  비밀번호 확인
 * @param {string} confirm_password 비밀번호
 * @param {number} user_id
 *
 * @returns {string} email
 */
const comparePassword = async (confirm_password, user_id) => {
  const user = await User.findByPk(user_id);
  if (user === null) {
    throw new Error('Can not find profile.');
  }
  const match = await bcrypt.compare(confirm_password, user.password);
  if (!match) {
    throw new Error('Incorrect password.');
  } else {
    return user.email;
  }
};

/**
 * 비밀번호 변경
 * @param {number} user_id
 * @param {string} new_password 새 비밀번호
 *
 * @returns {Object} { message: string, data : DBdata }
 */
const updatePassword = async (user_id, new_password) => {
  let message = '';
  const user = await User.findByPk(user_id);
  if (user === null) {
    throw new Error('Can not find profile.');
  }
  const encrypted_pw = await bcrypt.hash(new_password, 10);
  const data = await User.update(
    { password: encrypted_pw },
    {
      where: { id: user_id },
    },
  );
  if (data) {
    message = 'Password changed.';
    return { message, user };
  } else {
    throw new Error('Password changed failed.');
  }
};

/**
 * email을 입력 받아 인증번호 생성 후 캐시메모리에 저장
 * @param {string} email
 *
 * @returns {string} code
 */
const verifycode = (email) => {
  let code = parseInt(random.randomBytes(2).toString('hex'), 16).toString(10);
  //캐시메모리에 저장 (캐시 메모리 너무 많이 쌓이는 경우?)
  cache.put(email, code, 300000, (key, value) => {
    logger.info(`'verifycode is timeout. key: ${key} - value: ${value}'`);
    //console.log('key: ' + key + ' value: ' + value + ' timeout'); // 로그로 변경필요
  }); // key: email, value: code, 300000ms (5min) 후 삭제
  return code;
};

/**
 * 인증번호 체크
 * @param {string} email
 * @param {number} verifycode
 *
 * @returns {boolean}
 */
const checkCode = (email, verifycode) => {
  let cachecode = cache.get(email);
  if (cachecode) {
    if (parseInt(verifycode) !== parseInt(cachecode)) {
      throw new Error("Code dosesn't match.");
    } else {
      return true;
    }
  } else {
    throw new Error('Verifycode expired.');
  }
};

/**
 * 일회용 토큰 발급
 * @param {string} email
 *
 * @returns {object} data
 */
const issueOneTimeToken = async (email) => {
  let user = await findUser('email', email, 1);
  let one_time_access_token = await oneTimeToken({ type: 'OneTimeJWT', id: user.id });
  return one_time_access_token;
};

module.exports = {
  findUser,
  createUser,
  updateUser,
  verifyLogin,
  verifyRegister,
  findAttendance,
  createAttendance,
  findAttendanceDate,
  comparePassword,
  updatePassword,
  verifycode,
  checkCode,
  issueOneTimeToken,
};
