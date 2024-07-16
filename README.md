# ItsGymJinHae

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

## 프로젝트 개요
ItsGymJinHae는 컴퓨터 관련 업계에서 종사하지 않는 관리자를 위한 회원 관리 및 일반 사용자를 위한 예약 시스템입니다. 본 프로젝트는 잇츠짐 진해점 스피닝 예약 시스템을 디지털화하기 위해 개발되었습니다.

- **백엔드**: Node.js + Express
- **프론트엔드**: Vue.js
- **데이터베이스**: Firebase

개발 소요기간: **이틀**

## 소개
헬스장 프로그램 중 스피닝(Spinning)이라는 자전거 운동 프로그램의 자리를 예약하는 시스템입니다. 기존에는 관리자가 수기로 직접 예약을 받던 시스템에서 사용자가 직접 자리를 고를 수 있는 시스템으로 변경되었습니다.

## 주요 기능
- **회원 관리**: 회원은 이름과 전화번호를 이용해 예약할 수 있으며, 관리자는 사전에 제공된 ID와 패스워드를 사용해 관리자 페이지에 접근할 수 있습니다.
- **예약 시스템**: 사용자는 마이페이지에서 본인의 예약 목록을 확인할 수 있습니다. 하지만, 디지털 예약 방식에 익숙하지 않은 사용자 연령층을 고려하여 클라이언트와 협의 후 해당 페이지와 버튼은 숨겨두었습니다.
- **관리자 기능**: 관리자 페이지에서는 회원들의 전체 목록을 확인할 수 있으며, 회원 강제 탈퇴 및 예약 강제 취소가 가능합니다. 관리자 페이지 접근을 위한 인증 로직이 적용되어 있어, 제 3자의 악의적인 접근을 제한합니다.

## 프로젝트 구조
- **Node.js**: 백엔드 로직과 API 서버를 구현
- **Express**: 라우팅과 미들웨어 처리를 담당
- **Vue.js**: 사용자 인터페이스와 동적 콘텐츠를 제공
- **Firebase**: 사용자 데이터와 예약 정보를 저장

## 사용 방법
1. **회원 가입**: 이름과 전화번호를 입력하여 회원 가입
2. **로그인**: 등록된 회원 정보로 로그인
3. **예약**: 날짜와 시간을 선택하여 스피닝 자전거 자리 예약
4. **관리자 로그인**: 관리자 ID와 패스워드로 관리자 페이지 접근
5. **관리자 기능**: 회원 관리 및 예약 관리

## 화면 예시
![GitHub](image.png) 

## Contact
- **GitHub**: [Jeonghoonchoi74](https://github.com/Jeonghoonchoi74)

---

디지털 예약 시스템 도입으로 효율적인 회원 관리 및 예약 처리를 경험해보세요!
