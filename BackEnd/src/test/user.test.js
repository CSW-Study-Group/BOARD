'use strict';

const request = require('supertest');
const { app } = require('../../server');

const { User, Attendance } = require('../utils/connect');
const user = require('../controllers/user');

const { path, config, chalk } = require('../../loaders/module');

const bcrypt = require('bcrypt');

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

  test(`should return ${chalk.green(200)} with access_token and refresh_token if ${chalk.blue(
    `login is successful`,
  )}`, async () => {
    await user.postLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Authorize success.',
      code: 200,
      data: {
        access_token: expect.stringMatching(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]+$/),
        refresh_token: expect.stringMatching(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]+$/),
      },
    });
  });

  test(`should return ${chalk.yellow(401)} if ${chalk.blue(`email is incorrect`)}`, async () => {
    const error = new Error('Unauthorized email.');
    req.body.email = 'test_user123@example.com';

    await user.postLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: error.message, detail: 'No detail.' });
  });

  test(`should return ${chalk.yellow(401)} if ${chalk.blue(`password is incorrect`)}`, async () => {
    const error = new Error('Incorrect password.');
    req.body.password = 'password123';

    await user.postLogin(req, res);

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
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  test(`should register a new user and return ${chalk.green(201)} if ${chalk.blue(
    `verification is successful`,
  )}`, async () => {
    await User.destroy({ where: { email: 'test_register@example.com' } });
    await user.postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ code: 201, message: 'Register success.', data: 'No data.' });
  });

  test(`should return ${chalk.yellow(409)} and error message if ${chalk.blue(`username already exists`)}`, async () => {
    req.body.user_name = 'test_user';

    await user.postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      detail: 'No detail.',
      message: 'Exist username.',
    });
  });

  test(`should return ${chalk.yellow(409)} and error message if ${chalk.blue(`email already exists`)}`, async () => {
    req.body.email = 'test_user@example.com';

    await user.postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      detail: 'No detail.',
      message: 'Exist email.',
    });
  });

  test(`should return ${chalk.yellow(400)} and error message if ${chalk.blue(
    `username field is missing`,
  )}`, async () => {
    req.body.user_name = '';

    await user.postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      detail: 'No detail.',
      message: 'Please input username.',
    });
  });

  test(`should return ${chalk.yellow(400)} and error message if ${chalk.blue(`id field is missing`)}`, async () => {
    req.body.email = '';

    await user.postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      detail: 'No detail.',
      message: 'Please input id.',
    });
  });

  test(`should return ${chalk.yellow(400)} and error message if ${chalk.blue(
    `password field is missing`,
  )}`, async () => {
    req.body.password = '';

    await user.postRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      detail: 'No detail.',
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

  test(`should return ${chalk.green(200)} if ${chalk.blue(`user profile found`)}`, async () => {
    await user.getProfile(req, res);

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

  test(`should return ${chalk.yellow(404)} if ${chalk.blue(`profile is not found`)}`, async () => {
    req.decoded.id = '100';

    await user.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: 'No detail.',
        message: 'Can not find profile.',
      }),
    );
  });
});

/**
 * * 프로필 편집 테스트
 * 1. 프로필 편집 성공
 * 2. 프로필 편집 성공 (변경 없음)
 * 3. 프로필 편집 실패 (파일 형식 오류)
 * 4. 프로필 편집 실패 (중복 유저 이름 & 이메일)
 */
describe('editProfile', () => {
  let req, res, token, server;

  beforeAll(async () => {
    server = app.listen(config.get('server.port'));

    // 로그인하여 토큰 발급
    const res = await request(app)
      .post('/user/login')
      .send({ email: 'test_profile@example.com', password: 'password' });
    token = res.body.data.access_token;
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(async () => {
    req = {
      body: {
        user_name: 'test_profile',
        email: 'test_profile@example.com',
      },
      decoded: {
        id: '2',
      },
      file: {
        fieldname: 'profileImage',
        originalname: 'test_image.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('...', 'base64'),
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(async () => {
    await User.update({ user_name: 'test_profile', email: 'test_profile@example.com' }, { where: { id: 2 } });
    jest.clearAllMocks();
  });

  test(`should return ${chalk.green(200)} if ${chalk.blue(`edit profile successful`)}`, async () => {
    req.body.user_name = 'test_profile123';
    req.body.email = 'test_profile123@example.com';

    await user.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 200,
        message: 'Profile edit success.',
        data: expect.objectContaining({
          id: 2,
          user_name: 'test_profile123',
          email: 'test_profile123@example.com',
          profile: 'https://sonb-test-bucket.s3.ap-northeast-2.amazonaws.com/1691669898025364.png',
        }),
      }),
    );
  });

  test(`should return ${chalk.green(200)} if ${chalk.blue(`profile is not changed`)}`, async () => {
    delete req.file;

    await user.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 200,
        message: 'Profile no change.',
        data: expect.objectContaining({
          id: 2,
          user_name: 'test_profile',
          email: 'test_profile@example.com',
          profile: 'https://sonb-test-bucket.s3.ap-northeast-2.amazonaws.com/1691669898025364.png',
        }),
      }),
    );
  });

  test(`should return ${chalk.yellow(400)} if ${chalk.blue('profile image is not an image file')}`, async () => {
    req.file.mimetype = 'mp4/*';

    await user.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      detail: 'No detail.',
      message: 'Profile type must be only image.',
    });
  });

  test(`should return ${chalk.yellow(409)} if ${chalk.blue('username or email is already in use')}`, async () => {
    // 이미 사용 중인 username으로 요청
    const res1 = await request(app)
      .patch('/user/profile')
      .set('authorization', `${token}`)
      .send({ user_name: 'test_user', email: 'test_user123@example.com' });

    expect(res1.statusCode).toEqual(409);
    expect(res1.body.message).toEqual('The username is already in use.');

    // 이미 사용 중인 email로 요청
    const res2 = await request(app)
      .patch('/user/profile')
      .set('authorization', `${token}`)
      .send({ user_name: 'test_user123', email: 'test_user@example.com' });

    expect(res2.statusCode).toEqual(409);
    expect(res2.body.message).toEqual('The email is already in use.');
  });
});

/**
 * * 프로필 업로드 테스트
 * 1. 프로필 업로드 실패 (파일 사이즈 초과)
 */
describe('imgUpload', () => {
  let token, server, imagePath;

  beforeAll(async () => {
    server = app.listen(config.get('server.port'));

    imagePath = path.join(__dirname, 'fixtures', 'large-image.jpg');

    // 로그인하여 토큰 발급
    const res = await request(app).post('/user/login').send({ email: 'test_user@example.com', password: 'password' });
    token = res.body.data.access_token;
  });

  afterAll((done) => {
    server.close(done);
  });

  test(`should return ${chalk.yellow(413)} if ${chalk.blue('file size exceeds 10MB')}`, async () => {
    const res = await request(app).patch('/user/profile').set('authorization', `${token}`).attach('image', imagePath);

    expect(res.statusCode).toEqual(413);
    expect(res.body).toHaveProperty('code', 413);
    expect(res.body).toHaveProperty(
      'message',
      'File size exceeded. please check the file size and try again (not exceeding 10MB)',
    );
  });
});

/**
 * * 출석 체크 테스트
 * 1. 출석 체크 성공
 * 2. 출석 체크 실패 (오늘 이미 출석 함)
 */
describe('postAttendance', () => {
  let req, res;

  beforeEach(() => {
    req = { decoded: { id: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await Attendance.destroy({
      where: { user_id: 1 },
    });
  });

  test(`should return ${chalk.green(201)} if ${chalk.blue('attendance check is successful')}`, async () => {
    await user.postAttendance(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 201,
        message: 'Attendance check success.',
        data: 'No data.',
      }),
    );
  });

  test(`should return ${chalk.yellow(409)} if ${chalk.blue('attendance has already been checked today')}`, async () => {
    await user.postAttendance(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      detail: 'No detail.',
      message: 'Already checked attendance today.',
    });
  });
});

/**
 * * 출석일 가져오기 테스트
 * 1. 출석일 가져오기 성공
 */
describe('getAttendance', () => {
  let req, res;

  beforeEach(() => {
    req = { decoded: { id: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test(`should return ${chalk.green(200)} if ${chalk.blue('get attendance dates successfully')}`, async () => {
    await user.getAttendance(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 200,
        message: 'No message.',
        data: [],
      }),
    );
  });
});

/**
 * *비밀번호 변경 테스트
 * 1. 비밀번호 변경 성공
 * 2. 비밀번호 변경 실패 (비밀번호 에러)
 * 3. 프로필 조회 실패
 */
describe('passwordChange', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        confirm_password: 'password',
        new_password: 'newpassword',
      },
      decoded: { id: '1' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });
  afterEach(async () => {
    let encrypted_pw = await bcrypt.hash('password', 10);
    await User.update({ password: encrypted_pw }, { where: { id: '1' } });
    jest.clearAllMocks();
  });

  //비밀번호 변경 성공
  test(`should return ${chalk.green(200)} if ${chalk.blue(`Password changed.`)}`, async () => {
    await user.editPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 200,
        message: 'Password changed.',
        data: expect.objectContaining({
          id: 1,
          user_name: 'test_user',
          email: 'test_user@example.com',
        }),
      }),
    );
  });

  //비밀번호 변경 실패 (비밀번호 오류)
  test(`should return ${chalk.yellow(401)} if ${chalk.blue(`Incorrect password.`)}`, async () => {
    req.body.confirm_password = 'differentpassword';
    await user.editPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      detail: 'No detail.',
      message: 'Incorrect password.',
    });
  });

  //비밀번호 변경 실패 (프로필 조회 실패)
  test(`should return ${chalk.yellow(404)} if ${chalk.blue(`Can not find profile.`)}`, async () => {
    req.decoded.id = 6974;
    await user.editPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      detail: 'No detail.',
      message: 'Can not find profile.',
    });
  });
});
