> For Node.js server Practice (Sequelize(MySQL), JWT, bcrypt...)

### 📝 API Reference
## [home]

>**GET** / - 홈 화면 렌더링

>**GET** /about - 홈페이지에 대한 설명 페이지 렌더링

## [user]

>**GET** /user/login - 로그인 페이지 렌더링

>**POST** /user/login - 로그인 post 요청
+ [프론트](./FrontEnd/public/js/user/login.js)
  + 이메일 & 비밀번호 유효성 검사 & 전달
  + 정상 응답받을 시, 로컬 스토리지에 해당 Access & Refresh 토큰 저장하고 홈 화면으로 이동
+ [백엔드](./BackEnd/src/controllers/user/service.js)
  + 요청받은 이메일로 유저를 검색하고, 비밀번호 복호화 후 동일하면 Access & Refresh 토큰 리턴

>**GET** /user/register - 회원가입 페이지 렌더링

>**POST** /user/register - 회원가입 post 요청
+ [프론트](./FrontEnd/public/js/user/register.js)
  + 유저명 & 이메일 & 비밀번호 전달
  + 응답받은 코드가 200일시, 로그인 화면 이동
  + 응답받은 코드가 200이 아닐 시, 에러 메시지 화면 출력
+ [백엔드](./BackEnd/src/controllers/user/service.js)
  + 요청받은 유저명 & 이메일 & 비밀번호 유효성 검사
  + 유저명 & 이메일 중복체크
  + 이상 없을 시, 비밀번호 암호화 후 성공 코드 200 반환

>**GET** /user/profile - 프로필 열람 시, 유저 토큰 검사 요청
+ [프론트](./FrontEnd/public/js/index.js)
  + 화면상 프로필 클릭 시, 로컬스토리지안의 Access 토큰 전달
  + 응답받은 코드가 200일시, 유저정보를 파라미터로 파싱 하여, 해당 주소로 이동
  + 응답받은 코드가 419일시, Refresh 토큰으로 Access 토큰 재발급 요청. 그 후, 재발급 받은 Access 토큰 저장
  + 응답받은 코드가 이외의 것일 시, 재로그인을 위한 로그인 페이지로 이동
+ [백엔드](./BackEnd/src/controllers/user/service.js)
  + 받은 토큰 검사 후, 해당 토큰에 대한 유저정보 전달

>**GET** /user/profile/output - 프로필 HTML 렌더링
+ [프론트](./FrontEnd/public/js/index.js)
  + /user/profile에서 응답받은 유저정보를 파라미터로 파싱 하여, 해당 주소로 이동
+ [백엔드](./BackEnd/src/controllers/user/service.js)
  + 프론트에게 받은 주소 쿼리 & 파라미터가 유지된 채 프로필 HTML 렌더링

>**GET** /user/token/refresh - refresh 토큰 받아서, access token 재발급

## [board]

GET /board - 글 데이터 전체 전달

POST /board - 글 생성

GET /board/new - 생성 페이지 렌더링

GET /board/:id - id 번호의 글 페이지 렌더링

POST(delete) /board/:id - id 번호의 글 삭제

GET /board/:id/edit - id 번호의 글 edit 페이지 렌더링

POST /board/:id/edit - id 번호의 글 edit 후 post

GET /board/:id/auth - 해당 글 작성자와 로그인 중인 사용자 일치 확인(인증)
(해당 글 접근 시 [back] or [back, edit, delete] button 출력여부 결정)
