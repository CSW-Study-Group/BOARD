'use strict';

const { sequelize } = require('../src/utils/connect'); // db

const morgan = require('morgan'); // log
const logger = require('../src/functions/winston');

const config = require('config');

const methodOverride = require('method-override');

module.exports = {
  sequelize,
  morgan,
  logger,
  config,
  methodOverride,
};
