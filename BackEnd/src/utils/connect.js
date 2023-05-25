'use strict';

const Sequelize = require('sequelize');
const config = require('config');

const models = require('../models/index');

const sequelize = new Sequelize(
  config.get('mysql.database'),
  config.get('mysql.username'),
  config.get('mysql.password'),
  {
    host: config.get('mysql.host'),
    dialect: config.get('mysql.dialect'),
    timezone: config.get('mysql.timezone'), // Asia/Seoul: +09:00
    logging: config.get('server.status') === 'test' ? false : console.log,
  },
);

Object.values(models).forEach((model) => model.init(sequelize));
Object.values(models)
  .filter((model) => typeof model.associate === 'function')
  .forEach((model) => model.associate(models));

module.exports = {
  sequelize,
  ...models,
};
