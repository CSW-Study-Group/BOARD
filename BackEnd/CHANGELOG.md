# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.6.2](https://github.com/CSW-Study-Group/BOARD/compare/v1.6.1...v1.6.2) (2023-08-10)


### Features

* helmet모듈 & ip차단 함수 강화 ([1e23bf4](https://github.com/CSW-Study-Group/BOARD/commit/1e23bf432ef0165b2cb6a045760ce48195cf72a8))


### Bug Fixes

* dayjs 모듈 캐싱 문제 ([8b20f94](https://github.com/CSW-Study-Group/BOARD/commit/8b20f94b505695c3cfd507d215e92bd19baf0b13))

### [1.6.1](https://github.com/CSW-Study-Group/BOARD/compare/v1.6.0...v1.6.1) (2023-07-26)


### Features

* 비밀번호 변경 기능 추가 ([cdc5b54](https://github.com/CSW-Study-Group/BOARD/commit/cdc5b542dc21a957399a1bad72441f5e7c23298b))
* 서버 공격에 따른 ip 차단 기능 추가 ([af45988](https://github.com/CSW-Study-Group/BOARD/commit/af459883cfb185212d8a0ea240b4b046bd4ef3f5))


### Bug Fixes

* Morgan, Winston 누락 해결 & 리팩토링 ([13a751d](https://github.com/CSW-Study-Group/BOARD/commit/13a751dc8531ede996c595d17173702b0ce51eb4))

## [1.6.0](https://github.com/CSW-Study-Group/BOARD/compare/v1.5.0...v1.6.0) (2023-07-03)


### Features

* 게시글 생성 테스트 코드 ([098e707](https://github.com/CSW-Study-Group/BOARD/commit/098e707d9f97acd24e627d317de541b0f1171bcf))
* 게시글 수정 & 삭제 테스트 코드 ([1f0e5f4](https://github.com/CSW-Study-Group/BOARD/commit/1f0e5f41016990737ccd567ace7cb5b007df4fd0))
* 게시글 조회 테스트 코드 ([8ced1d3](https://github.com/CSW-Study-Group/BOARD/commit/8ced1d3532811031fc42e933fd6cc65de6e17f9f))
* 게시글 추천 테스트 코드 ([0edfe2f](https://github.com/CSW-Study-Group/BOARD/commit/0edfe2f0957ca1a312ca2950bbbcacd48f0b8a00))
* 유저 로그인 테스트 코드 ([4bf7e8b](https://github.com/CSW-Study-Group/BOARD/commit/4bf7e8b634033122292f055dbbc615cbf667f28b))
* 유저 프로필 조회 테스트 코드 ([d437bb8](https://github.com/CSW-Study-Group/BOARD/commit/d437bb8104a7a8ad2df1c45f1c836c2a039a3a2d))
* 유저 프로필 편집 테스트 코드 구성 ([71613ed](https://github.com/CSW-Study-Group/BOARD/commit/71613ed337c965dbb39589487118a0a0567df077))
* 유저 회원가입 테스트 코드 ([62c9246](https://github.com/CSW-Study-Group/BOARD/commit/62c924639a22c451e3e685b678a169092ccf8c76))
* 유저 회원가입 테스트 코드 구성 ([e493d5a](https://github.com/CSW-Study-Group/BOARD/commit/e493d5a9872bc4bd1a04e5456751638ccef51e4e))
* 출석 기능 tdd 추가 ([d9a03c1](https://github.com/CSW-Study-Group/BOARD/commit/d9a03c1438662caa6a518762e2c19e5d99685ee6))
* 출석 날짜 보기 기능 추가 ([7d1e2c2](https://github.com/CSW-Study-Group/BOARD/commit/7d1e2c2c3eaed41c6ed7f891ec5152c983e41a65))
* 출석체크 기능 추가 ([6df5a5d](https://github.com/CSW-Study-Group/BOARD/commit/6df5a5d02ededa5f1891c68a982652de36a9ef72))
* Board 테스트 코드 초기구성 ([49a879d](https://github.com/CSW-Study-Group/BOARD/commit/49a879d027b598b9a72380f6ee720f1af1378b60))
* board 테스트 코드 최종 ([269e573](https://github.com/CSW-Study-Group/BOARD/commit/269e573be51267f0723cfe9c6b78eeb3e5cd3eda))
* console.log색상 모듈 ([12ded7b](https://github.com/CSW-Study-Group/BOARD/commit/12ded7b91e1f8961e28e290d8ccb76a98ef826b5))
* feature 브렌치 pull ([74fae3f](https://github.com/CSW-Study-Group/BOARD/commit/74fae3f301211e4aaec6749cc94b53b0b7887803))
* feature 브렌치 pull ([c03b47b](https://github.com/CSW-Study-Group/BOARD/commit/c03b47bebb575b6598311b16c92698715694ffa1))
* User 이미지 업로드 테스트 코드 ([8e12372](https://github.com/CSW-Study-Group/BOARD/commit/8e12372dac71639c2eedc4c5369af1257153045b))
* User 프로필 편집 TDD 작성 & supertest ([459ff44](https://github.com/CSW-Study-Group/BOARD/commit/459ff441efce5951c8685d1c6c24549204f936f5))
* warn, error 레벨 로그 생성 추가 ([438f529](https://github.com/CSW-Study-Group/BOARD/commit/438f52920a33d4c335c075790bf6c325425326b2))


### Bug Fixes

* 게시글 인증 버그 해결 ([419988a](https://github.com/CSW-Study-Group/BOARD/commit/419988a0a71d4b5c319dc7ca60e4ebf1d1be4171))
* 달력에서 시작하는 요일이 이상한 문제를 고침 ([392f4c4](https://github.com/CSW-Study-Group/BOARD/commit/392f4c46660fdc1d59fd88fab27018a705b8b7f0))
* 달력에서 시작하는 요일이 이상한 문제를 고침 ([020aed8](https://github.com/CSW-Study-Group/BOARD/commit/020aed829ce749a6b0e17bc9cb62cb07750bb06f))
* 추천수가 보이지 않는 버그 해결 ([3d04ed1](https://github.com/CSW-Study-Group/BOARD/commit/3d04ed1b58a62c5e6e1b7482ccc5a1a362004655))
* 테스트 데이터 통일 ([7bce11a](https://github.com/CSW-Study-Group/BOARD/commit/7bce11a78ff3d089004c86c2ebe2999c36625f3d))
* 테스트 코드 형식, 상태코드, 중복코드 제거 ([66b8b36](https://github.com/CSW-Study-Group/BOARD/commit/66b8b36000cc9e501fefac920f6c68876c158cf3))

## [1.5.0](https://github.com/CSW-Study-Group/BOARD/compare/v1.3.2...v1.5.0) (2023-06-08)


### Features

* 댓글 더보기 기능 ([ab93d54](https://github.com/CSW-Study-Group/BOARD/commit/ab93d546ed82fcd6d38e2a3b200dee84ef3ee8ae))
* 댓글 불러오기 기능 ([6228fe8](https://github.com/CSW-Study-Group/BOARD/commit/6228fe87a4d16c1e3af20886e8e94d93e829438e))
* 댓글 삭제 기능 구현 ([31e73b8](https://github.com/CSW-Study-Group/BOARD/commit/31e73b83d20092847b43cdc0b4fc279a3f5ca48b))
* 댓글 삭제 작업중 ([2342a34](https://github.com/CSW-Study-Group/BOARD/commit/2342a347ac6e646ea7ce5764025cdf4109215cc1))
* 댓글 작성하기 기능 ([4113be7](https://github.com/CSW-Study-Group/BOARD/commit/4113be77d4f896e7debce39971f811e2bb58a7ca))
* Comment Sequelize 셋팅 ([09dd823](https://github.com/CSW-Study-Group/BOARD/commit/09dd823be6e26149c84e132a7df816c35d802497))
* err, warn 레벨 로그 저장 기능 추가 ([e61a2f7](https://github.com/CSW-Study-Group/BOARD/commit/e61a2f768146e3409bebf8cb8c208667ee66d94f))
* user 컨트롤러에 fail, success 함수 추가 ([9c59478](https://github.com/CSW-Study-Group/BOARD/commit/9c5947895005ce1cc8184853570319370e2966af))
* warn, error 레벨 로그 생성 추가 ([00ebe82](https://github.com/CSW-Study-Group/BOARD/commit/00ebe82c58d6194b34147c95b0259e680ee78dec))


### Bug Fixes

* 추천수 표기 & 마지막 페이지 오류 ([b4d101c](https://github.com/CSW-Study-Group/BOARD/commit/b4d101c5cf547c9ced2c228d8a2cbf4572f395c0))
* merge 충돌 해결 ([c9c9414](https://github.com/CSW-Study-Group/BOARD/commit/c9c9414271e386fb0139fc89d73687fd074fee0d))

### [1.3.3](https://github.com/CSW-Study-Group/BOARD/compare/v1.3.1...v1.3.3) (2023-05-03)


### Features

* 특정 ip 차단 코드 ([255543b](https://github.com/CSW-Study-Group/BOARD/commit/255543b3621471105aaadaf0a46033fe2c5df91e))
* bootstrap 4.6 업데이트 ([a660481](https://github.com/CSW-Study-Group/BOARD/commit/a660481904d220bc654a32c9268895a14d0346fd))
* ip logging ([ad91d97](https://github.com/CSW-Study-Group/BOARD/commit/ad91d97859c437a17a40d6a3c8ab6c3d6535e6b1))
* sentry 에러 트래킹 & 모니터링 ([f773b9d](https://github.com/CSW-Study-Group/BOARD/commit/f773b9d36061ce8c8752d12bf63399e5da1fdae2))


### Bug Fixes

* 게시글 수정 논리오류 ([9f2a54e](https://github.com/CSW-Study-Group/BOARD/commit/9f2a54e1b7ff80b4e6d2809c842c603c01cb2846))

### [1.3.1](https://github.com/SoN-B/Node.JS-Practice/compare/v1.2.1...v1.3.1) (2023-04-10)


### Bug Fixes

* 수정일 변경문제 ([765e991](https://github.com/SoN-B/Node.JS-Practice/commit/765e991796ce7875ecbb59156708e0c008786ba9))
* 작성자 검색 ([b787aca](https://github.com/SoN-B/Node.JS-Practice/commit/b787aca7336f3e09d23ee0dfeb5c729fab3231d6))
* token issue ([4f66040](https://github.com/SoN-B/Node.JS-Practice/commit/4f66040024bb98878178c48184ae234bad6e7851))

### [1.2.1](https://github.com/SoN-B/Node.JS-Practice/compare/v1.1.1...v1.2.1) (2023-03-24)


### Features

* 프로필 편집 ([c3a23b0](https://github.com/SoN-B/Node.JS-Practice/commit/c3a23b082a0d548f232af77c9d408e78b86fa43f))
* 프로필 편집 ([73d7878](https://github.com/SoN-B/Node.JS-Practice/commit/73d7878d1eddd82c1d9f8c2ba2f0b2d21e883df5))

### [1.1.1](https://github.com/SoN-B/Node.JS-Practice/compare/v1.0.1...v1.1.1) (2023-03-16)

### 1.1.0 (2023-03-16)


### Features

* 검색기능 & 조회수표시 ([f52768e](https://github.com/SoN-B/Node.JS-Practice/commit/f52768eb916c5b2fa8f2e957d16e986d50a528b1))
* 게시글 추천 기능 추가 ([5e5ac56](https://github.com/SoN-B/Node.JS-Practice/commit/5e5ac56f852a4da1fb61d1168a3181785d974989))
* 배포 설정 ([e2d6636](https://github.com/SoN-B/Node.JS-Practice/commit/e2d6636607e4ff01b0cdea19b55207eaff11672e))
* 배포 설정 추가 ([44686b0](https://github.com/SoN-B/Node.JS-Practice/commit/44686b0d7f5d5cc84c0387302560a5a72bdf05fe))
* 삭제확인기능 ([8fd9dec](https://github.com/SoN-B/Node.JS-Practice/commit/8fd9dec0e862858a127e5133226be8c62657bd6f))
* board/new 페이지 기능구현 ([9df7bd0](https://github.com/SoN-B/Node.JS-Practice/commit/9df7bd0094222952cc665503ed0e7be2f272ceaa))
* board/show & delete구현 ([8b2674a](https://github.com/SoN-B/Node.JS-Practice/commit/8b2674ab8b2e37e22c6660288b5130621e86fc69))
* delete 권한삭제 & show 닉네임 표시 ([ea21b1a](https://github.com/SoN-B/Node.JS-Practice/commit/ea21b1a8c7c04620a204bcbfd9ebba9232ac8113))
* Edit & delete기능 완료 ([7d39e2d](https://github.com/SoN-B/Node.JS-Practice/commit/7d39e2d642c64d30257bf7ee95363aef8d12fae2))
* Log out ([b4d701a](https://github.com/SoN-B/Node.JS-Practice/commit/b4d701a2487a4fd3e03e8cd3248a2c57f3f76d3b))
* Login Logout분리(Front) ([9a3e53c](https://github.com/SoN-B/Node.JS-Practice/commit/9a3e53caf763422ce1df17bbefe04521380a9c89))
* New버튼 로그인 검사 ([cb1e9f6](https://github.com/SoN-B/Node.JS-Practice/commit/cb1e9f6c37a0f23c449a841165abfb3e5b5ab308))
* post추가 & post<->user연결 & GET board, POST board추가 ([622d9c0](https://github.com/SoN-B/Node.JS-Practice/commit/622d9c01302b2a3001a5e87d768de5dd1b251e7f))
* refresh token 구현 ([8996546](https://github.com/SoN-B/Node.JS-Practice/commit/8996546b52f6e7eb1385556d7f7f5cf4e58b5be1))
