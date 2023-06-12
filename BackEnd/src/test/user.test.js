'use strict';

const { sequelize, User } = require('../utils/connect');
const { postLogin, postRegister, getProfile, editProfile } = require('../controllers/user');
const { chalk } = require('../../loaders/module');

/**
 * * 로그인 테스트
 * 1. 로그인 성공
 * 2. 존재하지 않는 email
 * 3. 비밀번호 틀림
 */
describe('postLogin', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: 'test_user@example.com',
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

  test(`should return ${chalk.green(200)} with access_token and refresh_token if ${chalk.blue(`login is successful`)}`, async () => {
    await postLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Authorize success.',
      code: 200,
      data: {
        access_token: expect.stringMatching(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]+$/),
        refresh_token: expect.stringMatching(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]+$/),
      }
    });
  });

  test(`should return ${chalk.yellow(401)} if ${chalk.blue(`email is incorrect`)}`, async () => {
    const error = new Error('Unauthorized email.');
    req.body.email = 'test_user123@example.com';

    await postLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: error.message, detail: 'No detail.' });
  });

  test(`should return ${chalk.yellow(401)} if ${chalk.blue(`password is incorrect`)}`, async () => {
    const error = new Error('Incorrect password.');
    req.body.password = 'password123';

    await postLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: error.message, detail: 'No detail.' });
  });
});

/**
 * * 회원가입 테스트
 * 1. 회원가입 성공
 * 2. 이미 존재하는 username
 * 3. 이미 존재하는 email
 * 4. username 미입력
 * 5. id(email) 미입력
 * 6. password 미입력
 */
describe('postRegister', () => {
  let req, res;

  beforeEach(async () => {
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
    await User.destroy({ where: { email: 'test_register@example.com' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`should register a new user and return status ${chalk.green(201)} if ${chalk.blue(`verification is successful`)}`, async () => {
    await postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ code: 201, message: "Register success.", data: "No data." });
  });

  it(`should return status ${chalk.yellow(409)} and error message if ${chalk.blue(`username already exists`)}`, async () => {
    req.body.user_name = 'test_user';

    await postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      detail: "No detail.",
      message: 'Exist username.',
    });
  });

  it(`should return status ${chalk.yellow(409)} and error message if ${chalk.blue(`email already exists`)}`, async () => {
    req.body.email = 'test_user@example.com';

    await postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      detail: "No detail.",
      message: 'Exist email.',
    });
  });

  it(`should return status ${chalk.yellow(400)} and error message if ${chalk.blue(`username field is missing`)}`, async () => {
    req.body.user_name = '';

    await postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      detail: "No detail.",
      message: 'Please input username.',
    });
  });

  it(`should return status ${chalk.yellow(400)} and error message if ${chalk.blue(`id field is missing`)}`, async () => {
    req.body.email = '';

    await postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      detail: "No detail.",
      message: 'Please input id.',
    });
  });

  it(`should return status ${chalk.yellow(400)} and error message if ${chalk.blue(`password field is missing`)}`, async () => {
    req.body.password = '';

    await postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      detail: "No detail.",
      message: 'Please input password.',
    });
  });
});

/**
 * * 프로필 조회 테스트
 * 1. 프로필 조회 성공
 * 2. 프로필 조회 실패
 */
describe('getProfile', () => {
  let req, res;

  beforeEach(() => {
    req = {
      decoded: {
        id: '1',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it(`should return status ${chalk.green(200)} if ${chalk.blue(`user profile found`)}`, async () => {
    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 200,
        data: expect.objectContaining({
          id: 1,
          user_name: 'test_user',
          email: 'test_user@example.com',
          profile: 'https://sonb-test-bucket.s3.ap-northeast-2.amazonaws.com/1691669898025364.png',
        }),
      }),
    );
  });

  it(`should return status ${chalk.yellow(404)} if ${chalk.blue(`profile is not found`)}`, async () => {
    req.decoded.id = '100';

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: "No detail.",
        message: 'Can not find profile.',
      }),
    );
  });
});

// describe('editProfile', () => {
//   let transaction;
//   let req, res;

//   beforeEach(async () => {
//     req = {
//       body: {
//         user_name: 'test_profile',
//         email: 'test_profile@example.com',
//       },
//       decoded: {
//         id: '2',
//       },
//       file: {
//         fieldname: 'profileImage',
//         originalname: 'test_image.jpg',
//         mimetype: 'image/jpeg',
//         buffer: Buffer.from('...', 'base64'),
//       },
//     };
//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     transaction = await sequelize.transaction();
//   });

//   afterEach(async () => {
//     jest.clearAllMocks();
//     await transaction.rollback();
//   });

//   it('should edit profile successfully', async () => {
//     req.body.user_name = 'test_profile123';

//     await editProfile(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith(
//       expect.objectContaining({
//         code: 200,
//         message: 'Profile Edit Success!',
//         data: expect.objectContaining({
//           id: 2,
//           user_name: 'test_profile123',
//           email: 'test_profile@example.com',
//           profile: 'https://sonb-test-bucket.s3.ap-northeast-2.amazonaws.com/1691669898025364.png',
//         }),
//       }),
//     );
//   });
// });
