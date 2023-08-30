'use strict';

const jwt = require('jsonwebtoken');

const config = require('config');

const access_secret_key = config.get('JWT.access_secret_key');
const refresh_secret_key = config.get('JWT.refresh_secret_key');

const accessToken = (payload) => {
  return jwt.sign(payload, access_secret_key, {
    expiresIn: '15m',
    issuer: config.get('JWT.issuer'),
  });
};

const refreshToken = (payload) => {
  return jwt.sign(payload, refresh_secret_key, {
    expiresIn: '1h',
    issuer: config.get('JWT.issuer'),
  });
};

const oneTimeToken = (payload) => {
  return jwt.sign(payload, access_secret_key, {
    expiresIn: '5m',
    issuer: config.get('JWT.issuer'),
  });
};

const issuanceToken = (req, res) => {
  return jwt.verify(req.headers.authorization, refresh_secret_key, (err, decoded) => {
    if (err) {
      return res.status(419).json({
        code: 419,
        message: 'Refresh token is invalid. Please login again.',
      });
    }

    const access_token = accessToken({ type: decoded.type, id: decoded.id });
    return res.status(200).json({
      message: 'Access token refresh success.',
      access_token: access_token,
    });
  });
};

module.exports = {
  accessToken,
  refreshToken,
  oneTimeToken,
  issuanceToken,
};
