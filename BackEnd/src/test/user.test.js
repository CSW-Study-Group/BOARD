'use strict';

const { postLogin } = require('../controllers/user');

describe('postLogin', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(), // 메서드 체이닝이 가능해야하므로 자기자신 res를 반환
      json: jest.fn(),
    };
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
