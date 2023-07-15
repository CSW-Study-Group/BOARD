'use strict';

const { BlockedIp } = require('../utils/connect');

const postBlockedIp = async (ip) => {
  return await BlockedIp.create({
    blocked_ip: ip,
  });
};

const getBlockedIp = async () => {
  return await BlockedIp.findAll();
};

module.exports = {
  postBlockedIp,
  getBlockedIp,
};
