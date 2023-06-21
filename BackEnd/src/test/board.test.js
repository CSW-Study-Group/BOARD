'use strict';

const request = require('supertest');
const { app } = require('../../server');

const { config, chalk } = require('../../loaders/module');

describe('getBoard', () => {
  let server;

  beforeAll(async () => {
    server = app.listen(config.get('server.port'));
  });

  afterAll((done) => {
    server.close(done);
  });

  test(`should return ${chalk.green(200)} and render post/index page if ${chalk.blue('data is not exists')}`, async () => {
    const res = await request(app).get('/board?page=1&limit=5');
    expect(res.statusCode).toEqual(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('There is no data to show.');
  });

  test(`should return ${chalk.green(200)} and render post/index page with error message if ${chalk.blue('page over 1000')}`, async () => {
    const res = await request(app).get('/board?page=1000&limit=5');
    expect(res.statusCode).toEqual(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('Page can only be a number less than 1000.');
  });

  test(`should return ${chalk.green(200)} and render post/index page with error message if ${chalk.blue('limit query wrong')}`, async () => {
    const res = await request(app).get('/board?page=1&limit=30');
    expect(res.statusCode).toEqual(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('Limit can only be 5, 10, 20.');
  });

  test(`should return ${chalk.green(200)} and render post/index page if ${chalk.blue('search successful')}`, async () => {
    const res = await request(app).get('/board?page=1&limit=5&searchType=title&searchText=test');
    expect(res.statusCode).toEqual(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('test');
  });
});