'use strict';

const { sequelize } = require('../src/utils/connect'); // db

const morgan = require('morgan'); // log
const logger = require('../src/functions/winston');

const path = require('path');
const config = require('config');

const methodOverride = require('method-override');

const sentry = require('@sentry/node'); // monitoring

// etc
const chalk = require('chalk');

module.exports = {
  sequelize,
  morgan,
  logger,
  path,
  config,
  methodOverride,
  sentry,
  chalk
};
