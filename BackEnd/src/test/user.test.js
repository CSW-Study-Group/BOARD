'use strict';

const { postLogin, postRegister } = require('../controllers/user');

describe('postLogin', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(), // 메서드 체이닝이 가능해야하므로 자기자신 res를 반환
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 200 with access_token and refresh_token if login is successful', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    };

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
    const req = {
      body: {
        email: 'test123@example.com',
        password: 'password123',
      },
    };

    await postLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ code: 405, message: error.message });
  });

  test('should return 405 if password is incorrect', async () => {
    const error = new Error('Incorrect password.');
    const req = {
      body: {
        email: 'test@example.com',
        password: 'password',
      },
    };

    await postLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ code: 405, message: error.message });
  });
});

describe('postRegister', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: 'test123@example.com',
        password: 'password123',
        user_name: 'testuser123',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user and return status 200 if verification is successful', async () => {
    await postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ code: 200 });
  });

  // it('should return status 409 and error message if username or email already exists', async () => {
  //   // user.verifyRegister 모듈의 반환 값을 Promise.resolve(false)로 설정
  //   user.verifyRegister = jest.fn().mockResolvedValue(false);

  //   await postRegister(req, res);

  //   expect(user.verifyRegister).toHaveBeenCalledWith(
  //     req.body.email,
  //     req.body.password,
  //     req.body.user_name
  //   );
  //   expect(res.status).toHaveBeenCalledWith(409);
  //   expect(res.json).toHaveBeenCalledWith({
  //     code: 409,
  //     message: 'Exist username.',
  //   });
  // });

  // it('should return status 405 and error message if any field is missing', async () => {
  //   req.body.email = ''; // email 필드를 빈 문자열로 설정하여 누락된 필드로 가정

  //   await postRegister(req, res);

  //   expect(user.verifyRegister).not.toHaveBeenCalled();
  //   expect(res.status).toHaveBeenCalledWith(405);
  //   expect(res.json).toHaveBeenCalledWith({
  //     code: 405,
  //     message: 'Please input email.',
  //   });
  // });

  // it('should return status 500 and error message for other errors', async () => {
  //   // user.verifyRegister 모듈이 에러를 발생시키도록 설정
  //   user.verifyRegister = jest.fn().mockRejectedValue(new Error('Unknown error'));

  //   await postRegister(req, res);

  //   expect(user.verifyRegister).toHaveBeenCalledWith(
  //     req.body.email,
  //     req.body.password,
  //     req.body.user_name
  //   );
  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.json).toHaveBeenCalledWith({
  //     code: 500,
  //     message: 'Unknown error',
  //   });
  // });
});
