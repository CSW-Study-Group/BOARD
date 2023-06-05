const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

const config = require('config');

aws.config.update({
  accessKeyId: config.get('s3.accessKeyId'),
  secretAccessKey: config.get('s3.secretAccessKey'),
  region: config.get('s3.region'),
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'sonb-test-bucket',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Math.floor(Math.random() * 1000).toString() + Date.now() + '.' + file.originalname.split('.').pop());
      // Math.random() * 1000).toString() + Date.now() -> 랜덤숫자, file.originalname.split(".").pop() -> PNG
      // 결과값 : 랜덤숫자.PNG
    },
    // key 속성 : 업로드하는 파일이 어떤 이름으로 버킷에 저장되는가에 대한 속성
  }),
  limits: {
    fileSize: 10 * 1024 * 1000, // 10M 파일 크기 제한
  },
});

/**
 * 이미지 받아와서 서버에 저장
 * 파일의 크기가 10Mb 넘어가면 400 반환
 */
const imgUpload = async (req, res, next) => {
  try {
    upload.single('image')(req, res, (err) => {
      // 프로필 사진 업로드
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        // 파일 크기가 제한을 초과한 경우
        return res.status(400).json({
          code: 400,
          message: 'File size exceeded. please check the file size and try again (not exceeding 10MB)',
        });
      } else if (err) {
        // 그 외의 에러인 경우
        return res.status(500).json({ code: 500, message: 'Server error.' });
      }
      return next();
    });
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};

module.exports = { upload, imgUpload };
