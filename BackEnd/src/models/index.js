'use strict';

const models = {
  User: require('./user'),
  Post: require('./post'),
  Comment: require('./comment'),
  Log: require('./log'),
  Attendance: require('./attendance'),
  BlockedIp: require('./blockedIp'),
};

module.exports = models;
