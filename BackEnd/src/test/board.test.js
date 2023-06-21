'use strict';

const request = require('supertest');
const { app } = require('../../server');

const board = require('../controllers/board');

const { config, chalk } = require('../../loaders/module');

/**
 * * 게시글 목록 조회 테스트
 * 1. 게시글이 없을 경우
 * 2. 페이지가 1000 이상일 경우
 * 3. limit 값이 5, 10, 20이 아닐 경우
 * 4. 검색어가 있을 경우
 */
describe('getBoard', () => {
  let server;

  beforeAll(async () => {
    server = app.listen(config.get('server.port'));
  });

  afterAll((done) => {
    server.close(done);
  });

  test(`should return ${chalk.green(200)} and render post/index page if ${chalk.blue('post exists')}`, async () => {
    const res = await request(app).get('/board?page=1&limit=5');
    expect(res.statusCode).toEqual(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('test_title');
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

/**
 * * 게시글 조회 테스트
 * 1. 게시글 조회 성공
 * 2. 게시글 조회 실패 (게시글이 없을 경우)
 */
describe('getBoardByPostId', () => {
  let server;

  beforeAll(async () => {
    server = app.listen(config.get('server.port'));
  });

  afterAll((done) => {
    server.close(done);
  });

  test(`should return ${chalk.green(200)} and render post/read page with post data if ${chalk.blue('post exists')}`, async () => {
    const res = await request(app)
      .get(`/board/${1}`)

    expect(res.statusCode).toEqual(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('test_title');
  });

  test(`should return ${chalk.yellow(404)} if ${chalk.blue('post is not exists')}`, async () => {
    const res = await request(app)
      .get(`/board/${2}`)

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('No data.');
  });
});