'use strict';

const board = require('../services/board');

const config = require('config');

const jwt = require('jsonwebtoken');
const access_secret_key = config.get('JWT.access_secret_key');

exports.auth = (req, res, next) => {
  // 인증 완료
  try {
    // 요청 헤더에 저장된 토큰(req.headers.authorization)과 비밀키를 사용하여 토큰을 req.decoded에 반환
    req.decoded = jwt.verify(req.headers.authorization, access_secret_key);
    return next();
  } catch (error) {
    // 인증 실패
    // 유효시간이 초과된 경우
    if (error.name === 'TokenExpiredError') {
      return res.status(419).json({
        code: 419,
        message: 'Access token has expired.',
      });
    }
    // 토큰의 비밀키가 일치하지 않는 경우
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 401,
        message: 'Access token is invalid.',
      });
    }
  }
};

exports.boardAuth = async (req, res, next) => {
  let user_id, data;

  try {
    req.decoded = jwt.verify(req.headers.authorization, access_secret_key);
    user_id = req.decoded.id;

    data = await board.authCheckPost(req.params.id);
    if (user_id === data.user_id) {
      return next();
    } else {
      return res.status(401).json({
        code: 401,
        message: 'User id does not match the post author id.',
      });
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(419).json({
        code: 419,
        message: 'Access token has expired.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 401,
        message: 'Access token is invalid.',
      });
    }
  }
};
