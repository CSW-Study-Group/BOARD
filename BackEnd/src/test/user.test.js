'use strict';

const { User } = require('../utils/connect');
const { postLogin, postRegister } = require('../controllers/user');

/**
 * 로그인 테스트
 * 1. 로그인 성공
 * 2. 존재하지 않는 email
 * 3. 비밀번호 틀림
 */
describe('postLogin', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: 'testuser@example.com',
        password: 'password',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(), // 메서드 체이닝이 가능해야하므로 자기자신 res를 반환
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 200 with access_token and refresh_token if login is successful', async () => {
    await postLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Authorize success.',
      code: 200,
      access_token: expect.stringMatching(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]+$/),
      refresh_token: expect.stringMatching(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]+$/),
    });
  });

  test('should return 405 if email is incorrect', async () => {
    const error = new Error('Unauthorized email.');
    req.body.email = 'testuser123@example.com';

    await postLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ code: 405, message: error.message });
  });

  test('should return 405 if password is incorrect', async () => {
    const error = new Error('Incorrect password.');
    req.body.password = 'password123';

    await postLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ code: 405, message: error.message });
  });
});

/**
 * 회원가입 테스트
 * 1. 회원가입 성공
 * 2. 이미 존재하는 username
 * 3. 이미 존재하는 email
 * 4. username 미입력
 * 5. id(email) 미입력
 * 6. password 미입력
 */
describe('postRegister', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: 'test_register@example.com',
        password: 'password',
        user_name: 'test_register',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await User.destroy({ where: { email: 'test_register@example.com' } });
  });

  it('should register a new user and return status 200 if verification is successful', async () => {
    await postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ code: 200 });
  });

  it('should return status 409 and error message if username already exists', async () => {
    req.body.user_name = 'testuser';

    await postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      code: 409,
      message: 'Exist username.',
    });
  });

  it('should return status 409 and error message if email already exists', async () => {
    req.body.email = 'testuser@example.com';

    await postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      code: 409,
      message: 'Exist email.',
    });
  });

  it('should return status 405 and error message if username field is missing', async () => {
    req.body.user_name = '';

    await postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      code: 405,
      message: 'Please input username.',
    });
  });

  it('should return status 405 and error message if id field is missing', async () => {
    req.body.email = '';

    await postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      code: 405,
      message: 'Please input id.',
    });
  });

  it('should return status 405 and error message if password field is missing', async () => {
    req.body.password = '';

    await postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      code: 405,
      message: 'Please input password.',
    });
  });
});
