'use strict';

const request = require('supertest');
const { app } = require('../../server');

const { Post, Comment } = require('../utils/connect');
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
      .get(`/board/${100}`)

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('No data.');
  });
});

/**
 * * 게시글 작성 테스트
 * 1. 게시글 작성 성공
 */
describe('postBoard', () => {
  let server, token;

  beforeAll(async () => {
    server = app.listen(config.get('server.port'));

    const res = await request(app)
      .post('/user/login')
      .send({ email: 'test_profile@example.com', password: 'password' });
    token = res.body.data.access_token;
  });

  afterEach(async () => {
    await Post.destroy({ where: { title: 'post_test' } });
  });

  afterAll((done) => {
    server.close(done);
  });

  test(`should return ${chalk.green(201)} if ${chalk.blue('create a new post successful')}`, async () => {
    const title = 'post_test';
    const content = 'test_content';

    const res = await request(app)
      .post('/board')
      .set('authorization', token)
      .send({ title: title, content: content });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Post created success.');
  });
});

/**
 * * 게시글 수정 테스트
 * 1. 게시글 수정 성공
 * 2. 게시글 수정 실패 (게시글 작성자 id와 로그인한 유저 id가 다를 경우)
 */
describe('updateBoardByPostId', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { title: 'update_title', content: 'update_content' },
      params: { id: 1 },
      decoded: { id: 1 },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await Post.update(
      {
        title: 'test_title',
        content: 'test_content',
        updated_at: new Date(),
      },
      {
        where: { id: 1 },
      }
    );
  });

  it(`should return ${chalk.green(200)} if ${chalk.blue('post is updated successful')}`, async () => {
    await board.boardUpdateByPostId(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ code: 200, message: "Post updated success.", data: "No data." });
  });

  it(`should return ${chalk.yellow(403)} if ${chalk.blue('user is not authorized to update post')}`, async () => {
    req.decoded.id = 2;

    await board.boardUpdateByPostId(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      detail: "No detail.",
      message: 'You are not authorized to update this post.',
    });
  });
});

/**
 * * 게시글 삭제 테스트
 * 1. 게시글 삭제 성공
 * 2. 게시글 삭제 실패 (게시글 작성자 id와 로그인한 유저 id가 다를 경우)
 */
describe('deleteBoardByPostId', () => {
  let req, res, post_id;

  beforeEach(() => {
    req = {
      params: { id: post_id },
      decoded: { id: 1 },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  beforeAll(async () => {
    const post = await Post.create({
      title: 'delete_title',
      content: 'delete_content',
      user_id: 1,
    });

    post_id = post.id;
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`should return ${chalk.green(200)} if ${chalk.blue('post is deleted successful')}`, async () => {
    await board.boardDeleteByPostId(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ code: 200, message: "Post deleted success.", data: "No data." });
  });

  it(`should return ${chalk.yellow(403)} if ${chalk.blue('user is not authorized to delete post')}`, async () => {
    req.decoded.id = 2;
    req.params.id = 1;

    await board.boardDeleteByPostId(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      detail: "No detail.",
      message: 'You are not authorized to delete this post.',
    });
  });
});

/**
 * * 게시글 추천 테스트
 * 1. 게시글 추천 성공 (추천 O, X)
 */
describe('postBoardRecommand', () => {
  let req, res;

  beforeEach(() => {
    req = { decoded: { id: 1 }, params: { id: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`should return ${chalk.green(200)} if ${chalk.blue('board recommend created successfully')}`, async () => {
    await board.boardRecommand(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 200,
        message: 'create',
        data: expect.objectContaining({
          recommand: 1
        })
      })
    );
  });

  it(`should return ${chalk.green(200)} if ${chalk.blue('board recommend deleted successfully')}`, async () => {
    await board.boardRecommand(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 200,
        message: 'delete',
        data: expect.objectContaining({
          recommand: 0
        })
      })
    );
  });
});

/**
 * * 게시글 댓글 생성 테스트
 * 1. 게시글 댓글 생성 성공
 */
describe('postBoardComment', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { comment: 'test_comment' }, decoded: { id: 1 }, params: { id: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await Comment.destroy({
      where: { user_id: 1, post_id: 1, comment: 'test_comment' },
    });
  });

  it(`should return ${chalk.green(201)} if ${chalk.blue('comment is created successfully')}`, async () => {
    await board.boardCommentPost(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ code: 201, data: "No data.", message: 'Comment created success.' });
  });
});

/**
 * * 게시글 댓글 삭제 테스트
 * 1. 게시글 댓글 삭제 성공
 * 2. 게시글 댓글 삭제 실패 (댓글 작성자 id와 로그인한 유저 id가 다를 경우)
 */
describe('deleteBoardComment', () => {
  let req, res, comment_id;

  beforeAll(async () => {
    comment_id = await Comment.create({
      comment: 'test_comment',
      user_id: 1,
      post_id: 1,
    });

    comment_id = comment_id.id;
  });

  beforeEach(() => {
    req = { params: { comment_id: comment_id }, decoded: { id: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`should return ${chalk.green(200)} if ${chalk.blue('comment is deleted successfully')}`, async () => {
    await board.boardCommentDelete(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ code: 200, data: 'No data.', message: 'Comment deleted success.' });
  });

  it(`should return ${chalk.yellow(401)} if ${chalk.blue('user is unauthorized')}`, async () => {
    req.decoded.id = 2;

    await board.boardCommentDelete(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ detail: 'No detail.', message: 'unauthorized' });
  });
});

/**
 * * 게시글 댓글 더보기 테스트
 * 1. 게시글 댓글 더보기 성공
 * 2. 게시글 댓글 더보기 실패 (comment_page가 1000 이상일 경우)
 */
describe('boardCommentMore', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: 1, comment_page: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`should return ${chalk.green(200)} if ${chalk.blue('comments are brought up successfully')}`, async () => {
    await board.boardCommentMore(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      code: 200,
      message: 'Bringing up comments success.',
      data: expect.objectContaining({
        count: expect.any(Number),
        more: expect.any(Boolean),
        rows: expect.any(Array),
      })
    });
  });

  it(`should return ${chalk.yellow(400)} if ${chalk.blue('comment_page is greater than or equal to 1000')}`, async () => {
    await board.boardCommentMore({ params: { id: 1, comment_page: 1000 } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ detail: 'No detail.', message: 'Page can only be a number less than 1000.' });
  });
});