# Board 사이드 프로젝트

>**목적** : 개인 사이드 프로젝트를 통하여, 배운 내용을 바로 적용시켜 보거나, 추가적인 공부를 위한 용도

- [MongoDB Board](https://github.com/SoN-B/Node.JS-Board) 개인 스터디 내용을 활용하여, MySQL 시스템으로 전환
- Passport 로그인 방식 -> JWT 로그인 방식으로 전환
- Bootstrap 4.0을 활용한 페이지 구성 & 프론트와 백엔드의 통신과정 이해

## 📚 Contents

- [Features](#-Features)
- [API Reference](#-API-Reference)
- [Execution Screens](#-Execution-Screens)
- [Module](#-Dependency-Module)

## ⚙ Features

1. JWT를 활용한 로그인, 회원가입
2. Access 토큰 이외 Refresh 토큰을 추가하여 보안 강화
3. 로컬 스토리지를 활용한 토큰 저장 & 로그아웃
4. MD5 해시 함수를 활용하여 사용자 비밀번호 단방향 암호화
5. 기본적인 게시판 CRUD
6. 페이징 기능 & 해당 페이지에 보여줄 게시글 수 지정 가능
7. (제목, 내용), (제목), (내용), (작성자)의 종류로 게시글 검색 가능
8. 해당 게시글 조회 시, 조회 수 증가
9. 해당 게시글과 현재 로그인된 사용자를 비교하여 특정 권한 지정
10. 주소 상의 쿼리 스트링을 활용하여, 이전 페이지 기억

## 📝 API Reference

>**HOME**

**GET** / - 홈 화면 렌더링

**GET** /about - 홈페이지에 대한 설명 페이지 렌더링

<br>

>**USER**

**GET** /user/login - 로그인 페이지 렌더링

<details>

<summary><b>POST</b> /user/login - 로그인 post 요청</summary>

* [프론트](./FrontEnd/public/js/user/login.js)

  * 이메일 & 비밀번호 유효성 검사 & 전달
  
  * 정상 응답받을 시, 로컬 스토리지에 해당 Access & Refresh 토큰 저장하고 홈 화면으로 이동
  
* [백엔드](./BackEnd/src/controllers/user/service.js)

  * 요청받은 이메일로 유저를 검색하고, 비밀번호 복호화 후 동일하면 Access & Refresh 토큰 리턴

</details>

**GET** /user/register - 회원가입 페이지 렌더링

<details>

<summary><b>POST</b> /user/register - 회원가입 post 요청</summary>

* [프론트](./FrontEnd/public/js/user/register.js)

  * 유저명 & 이메일 & 비밀번호 전달
  
  * 응답받은 코드가 200일시, 로그인 화면 이동
  
  * 응답받은 코드가 200이 아닐 시, 에러 메시지 화면 출력
  
* [백엔드](./BackEnd/src/controllers/user/service.js)

  * 요청받은 유저명 & 이메일 & 비밀번호 유효성 검사
  
  * 유저명 & 이메일 중복체크
  
  * 이상 없을 시, 비밀번호 암호화 후 성공 코드 200 반환
  
</details>

<details>

<summary><b>GET</b> /user/profile - 프로필 열람 시, 유저 토큰 검사 요청</summary>

* [프론트](./FrontEnd/public/js/index.js)

  * 화면상 프로필 클릭 시, 로컬스토리지안의 Access 토큰 전달
  
  * 응답받은 코드가 200일시, 유저정보를 파라미터로 파싱 하여, 해당 주소로 이동
  
  * 응답받은 코드가 419일시, Refresh 토큰으로 Access 토큰 재발급 요청. 그 후, 재발급 받은 Access 토큰 저장
  
  * 응답받은 코드가 이외의 것일 시, 재로그인을 위한 로그인 페이지로 이동
  
* [백엔드](./BackEnd/src/controllers/user/service.js)

  * 받은 토큰 검사 후, 해당 토큰에 대한 유저정보 전달
  
</details>

<details>

<summary><b>GET</b> /user/profile/output - 프로필 HTML 렌더링</summary>

* [프론트](./FrontEnd/public/js/index.js)

  * /user/profile에서 응답받은 유저정보를 파라미터로 파싱 하여, 해당 주소로 이동
  
* [백엔드](./BackEnd/src/controllers/user/service.js)

  * 프론트에게 받은 주소 쿼리 & 파라미터가 유지된 채 프로필 HTML 렌더링
  
</details>

**GET** /user/token/refresh - refresh 토큰 받아서, access token 재발급

<br>

>**BOARD**

<details>

<summary><b>GET</b> /board - 조건에 따른 글 데이터 전달</summary>

* [프론트](./FrontEnd/views/post/index.ejs)

  * 위 메뉴 'Board'를 클릭 시, /board API 호출
  
  * 글 ID, 제목, 조회 수, 작성자, 작성 시간 등을 표시할 수 있다.
  
  * 글의 (제목, 글),(제목),(글),(작성자)로 게시글을 검색할 수 있다.
  
  * 페이지가 존재하고, 페이지당 표시될 게시글의 수를 정할 수 있다.
  
  * New 버튼 클릭 시, 브라우저 내 로컬 스토리지에서 토큰 검사 (토큰이 없을 시, 로그인 화면으로 이동)
  
* [백엔드](./BackEnd/src/controllers/board/service.js)

  * 프론트로부터 page, limit, Search 종류 등을 전달받아, 해당 조건에 맞는 게시글로 응답

</details>

<details>

<summary><b>POST</b> /board - 글 생성</summary>

* [프론트](./FrontEnd/public/js/post/create.js)

  * 제목 & 글 유효성 검사
  
  * 작성하고자 하는 제목과, 글을 입력 후 Access 토큰과 함께, 해당 데이터 전달
  
  * 글 전달 후, 419코드를 응답받게 되면, Refresh 토큰으로 Access 재발급 요청
  
  * 그 이외의 코드는 로그인 화면 이동
  
* [백엔드](./BackEnd/src/controllers/board/service.js)

  * 프론트쪽에서부터 전달받은 토큰 검사 후, 해당 데이터로 글 생성

</details>

**GET** /board/new - 글 생성 페이지 렌더링

<details>

<summary><b>GET</b> /board/:id - id 번호의 글 페이지 렌더링</summary>

* [프론트](./FrontEnd/views/post/index.ejs)

  * /board 페이지에서 해당 글을 클릭 시, 현재 페이지 & 검색어 등을 기억하며, /board/:id API 호출
  
  * 그 후, 페이지에서 항상 작성된 글과 현재 로그인한 사용자와 매칭하여 작성자가 맞는다면, [Back] 버튼 이 외 [Edit], [Delete] 버튼 노출
  
  * [Back] & [Edit] -> 현재 페이지 & 검색어 등을 기억, [Delete] 버튼 작동 시, 1페이지로 이동
  
* [백엔드](./BackEnd/src/controllers/board/service.js)

  * 호출 요청을 받고, 파라미터의 id를 파싱 하여 해당 id의 게시글 데이터로 응답과 함께, [작성된 페이지](./FrontEnd/views/post/show.ejs) 렌더링
  
  * API 요청당 조회 수 +1

</details>

**POST**(delete) /board/:id - id 번호의 글 삭제

**GET** /board/:id/edit - id 번호의 글 데이터와 함께, edit 페이지 렌더링

<details>

<summary><b>POST</b> /board/:id/edit - id 번호의 글 edit 후 post</summary>

* [프론트](./FrontEnd/public/js/post/update.js)

  * 수정하고자 하는 해당 글의 제목 & 글 유효성 검사
  
  * Access 토큰과 함께 수정 API 호출
  
* [백엔드](./BackEnd/src/controllers/board/service.js)

  * 프론트로부터 전달받은 데이터로 해당 게시글 내용 변경
  
</details>

<details>

<summary><b>GET</b> /board/:id/auth - 해당 글 작성자와 로그인 중인 사용자 일치 확인(인증)</summary>

  * 프론트로부터 토큰을 전달받고, 토큰 검사 후, 주소상 게시글의 id가 토큰에 존재하는 사용자가 작성한 글이 맞는지 확인
  
  * 그 후, 해당 글 페이지의 [back] or [back, edit, delete] button 출력여부 결정

</details>

## 💻 Execution Screens

| ![첫페이지](https://user-images.githubusercontent.com/103496262/197594246-1b8f38d6-5629-452f-9e0d-65cdc6f2165d.JPG) | ![메인페이지](https://user-images.githubusercontent.com/103496262/197594248-86b5fbc9-758e-4dd3-9928-47fc6267bbc8.JPG) | ![로그인](https://user-images.githubusercontent.com/103496262/197594244-12bcb35c-7aac-44dd-a429-d37be4129cd8.JPG) | ![회원가입](https://user-images.githubusercontent.com/103496262/197594262-c83cf72d-7681-4ee8-9b3d-6bf75f1a8e2e.JPG) |
| :-----------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: |
|                                                      첫 페이지                                                      |                                                       메인 페이지                                                        |                                                      로그인                                                       |                                                     회원가입                                                      |

| ![글작성](https://user-images.githubusercontent.com/103496262/197594251-a6cb939c-5610-4f34-8fea-665866e2b1a4.JPG) | ![게시글 보기](https://user-images.githubusercontent.com/103496262/197594254-9aa7b7eb-e282-445b-a82b-a7645fdc8c0a.JPG) | ![출석체크보상 토큰받기](https://user-images.githubusercontent.com/103496262/197594242-c692895c-90f2-47cb-b3e3-30ddc58d100a.JPG) | ![설정페이지](https://user-images.githubusercontent.com/103496262/197594859-ead2455a-d3b1-4ec0-8ef4-19f1dff163b4.JPG) |
| :-----------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: |
|                                                      글작성 페이지                                                      |                                                       게시글 보기                                                        |                                                      출석체크 보상                                                        |                                                     설정 페이지                                                      |

| ![도트맵](https://user-images.githubusercontent.com/103496262/197594258-1ed03775-c6ca-4b0d-bac4-0f1d4fe41abd.png) | ![땅구매 모달창](https://user-images.githubusercontent.com/103496262/197594259-241a9d1b-5463-40cb-8de2-1ad91b2ebe87.JPG) | ![구매된 땅 표시](https://user-images.githubusercontent.com/103496262/197594231-cd4a6cf7-40a4-468f-852f-75c7e0275a00.png) |
| :-----------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: |
|                                                     도트맵 페이지                                                      |                                                       땅구매 모달창                                                        |                                                      구매된 땅 표시                                                      |

## 🛠 Dependency Module

```
  "dependencies": {
    "body-parser": "^1.20.0",
    "config": "^3.3.7",
    "ejs": "^3.1.8",
    "express": "^4.18.1",
    "jsonwebtoken": "^8.5.1",
    "md5": "^2.3.0",
    "mysql2": "^2.3.3",
    "sequelize": "^6.21.3",
    "sequelize-cli": "^6.4.1"
  }
```
