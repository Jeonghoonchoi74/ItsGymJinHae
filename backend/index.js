const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),  // 이 줄을 확인하세요
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const admin_id = process.env.ADMIN_ID;
const admin_pw = process.env.ADMIN_PW;

const db = admin.firestore();
const app = express();

app.use(cors({
  origin: 'http://localhost:8080', // 프론트엔드 도메인
  credentials: true
}));
app.use(bodyParser.json());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // 개발 환경에서는 false, 프로덕션에서는 true로 설정
}));

// 회원가입
app.post('/register', async (req, res) => {
  const { name, phoneNumber } = req.body;
  try {
    const userRef = db.collection('users').doc(phoneNumber);
    const doc = await userRef.get();
    if (doc.exists) {
      res.status(400).send({ error: '이미 가입된 전화번호가 존재합니다.' });
    } else {
      await userRef.set({
        name,
        phoneNumber,
        reservations: [],
        lastLogin: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(200).send({ message: '회원가입이 완료되었습니다.' });
    }
  } catch (error) {
    res.status(400).send({ error: '회원가입에 실패했습니다.', details: error.message });
  }
});

// 일반 사용자 로그인 처리
app.post('/login', async (req, res) => {
  const { name, phoneNumber } = req.body;
  try {
    if (name === admin_id && phoneNumber === admin_pw) {
      req.session.isAdmin = true;
      res.status(200).send({ message: '관리자 로그인 성공', redirect: '/cGFnZWFkbWlu' });
    } else {
      const userRef = db.collection('users').doc(phoneNumber);
      const doc = await userRef.get();
      if (doc.exists && doc.data().name === name) {
        req.session.user = { name, phoneNumber };
        res.status(200).send({ message: '로그인이 완료되었습니다.', redirect: '/reservations' });
      } else {
        res.status(400).send({ error: '사용자 정보를 찾을 수 없습니다.' });
      }
    }
  } catch (error) {
    res.status(400).send({ error: '로그인에 실패했습니다.', details: error.message });
  }
});

// 관리자인지 확인하는 엔드포인트
app.get('/checkAdmin', (req, res) => {
  if (req.session.isAdmin) {
    res.status(200).send({ isAdmin: true });
  } else {
    res.status(200).send({ isAdmin: false });
  }
});

// 자리 예약하기
app.post('/reserve', async (req, res) => {
  const { date, time, seat } = req.body;
  const phoneNumber = req.session.user.phoneNumber;
  try {
    const reservationRef = db.collection('reservations').doc(`${date}-${time}-${seat}`);
    const doc = await reservationRef.get();
    if (doc.exists) {
      res.status(400).send({ error: '이미 예약된 자리입니다.' });
      return;
    }

    const sameTimeReservations = await db.collection('reservations')
      .where('phoneNumber', '==', phoneNumber)
      .where('date', '==', date)
      .where('time', '==', time)
      .get();

    if (!sameTimeReservations.empty) {
      res.status(400).send({ error: '같은 시간대에 이미 예약하셨습니다.' });
      return;
    }

    const userRef = db.collection('users').doc(phoneNumber);
    const userDoc = await userRef.get();
    const userReservations = userDoc.data().reservations || [];

    if (userReservations.length >= 5) {
      res.status(400).send({ error: '최대 5개의 예약만 가능합니다.' });
      return;
    }

    await reservationRef.set({
      phoneNumber,
      date,
      time,
      seat,
      reservedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await userRef.update({
      reservations: admin.firestore.FieldValue.arrayUnion({
        date,
        time,
        seat
      })
    });

    res.status(200).send({ message: '예약이 완료되었습니다.' });
  } catch (error) {
    res.status(400).send({ error: '예약에 실패했습니다.', details: error.message });
  }
});

// 자리 취소하기
app.post('/cancelReservation', async (req, res) => {
  const { date, time, seat } = req.body;
  const phoneNumber = req.session.user.phoneNumber;
  try {
    const reservationRef = db.collection('reservations').doc(`${date}-${time}-${seat}`);
    const doc = await reservationRef.get();
    if (doc.exists && doc.data().phoneNumber === phoneNumber) {
      await reservationRef.delete();

      const userRef = db.collection('users').doc(phoneNumber);
      await userRef.update({
        reservations: admin.firestore.FieldValue.arrayRemove({
          date,
          time,
          seat
        })
      });

      res.status(200).send({ message: '예약이 취소되었습니다.' });
    } else {
      res.status(400).send({ error: '예약 정보를 찾을 수 없습니다.' });
    }
  } catch (error) {
    res.status(400).send({ error: '예약 취소에 실패했습니다.', details: error.message });
  }
});

// 특정 시간대의 자리 상태 확인하기
app.get('/seats', async (req, res) => {
  const { date, time } = req.query;
  try {
    const reservationsSnapshot = await db.collection('reservations')
      .where('date', '==', date)
      .where('time', '==', time)
      .get();
    const seats = Array(24).fill('available');
    reservationsSnapshot.forEach(doc => {
      seats[doc.data().seat] = 'reserved';
    });
    res.status(200).send({ seats });
  } catch (error) {
    res.status(400).send({ error: '자리 상태를 가져오는데 실패했습니다.', details: error.message });
  }
});

// 사용자 예약 정보 가져오기
app.get('/myReservations', async (req, res) => {
  const phoneNumber = req.session.user.phoneNumber;
  try {
    const userRef = db.collection('users').doc(phoneNumber);
    const doc = await userRef.get();
    if (doc.exists) {
      res.status(200).send({ reservations: doc.data().reservations });
    } else {
      res.status(400).send({ error: '사용자 정보를 찾을 수 없습니다.' });
    }
  } catch (error) {
    res.status(400).send({ error: '예약 정보를 가져오는데 실패했습니다.', details: error.message });
  }
});

// 회원 탈퇴
app.post('/deleteAccount', async (req, res) => {
  const phoneNumber = req.session.user.phoneNumber;
  try {
    // 회원 정보 삭제
    const userRef = db.collection('users').doc(phoneNumber);
    await userRef.delete();

    // 회원의 모든 예약 정보 삭제
    const reservationsSnapshot = await db.collection('reservations').where('phoneNumber', '==', phoneNumber).get();
    const batch = db.batch();
    reservationsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.status(200).send({ message: '회원 탈퇴가 완료되었습니다.' });
  } catch (error) {
    res.status(400).send({ error: '회원 탈퇴에 실패했습니다.', details: error.message });
  }
});

// 관리자가 사용자 예약 강제 취소하기
app.post('/admin/cancelReservation', async (req, res) => {
  const { phoneNumber, date, time, seat } = req.body;
  try {
    const reservationRef = db.collection('reservations').doc(`${date}-${time}-${seat}`);
    const doc = await reservationRef.get();
    if (doc.exists && doc.data().phoneNumber === phoneNumber) {
      await reservationRef.delete();

      const userRef = db.collection('users').doc(phoneNumber);
      await userRef.update({
        reservations: admin.firestore.FieldValue.arrayRemove({
          date,
          time,
          seat
        })
      });

      res.status(200).send({ message: '예약이 취소되었습니다.' });
    } else {
      res.status(400).send({ error: '예약 정보를 찾을 수 없습니다.' });
    }
  } catch (error) {
    res.status(400).send({ error: '예약 취소에 실패했습니다.', details: error.message });
  }
});

// 관리자가 사용자 정보 삭제하기
app.delete('/admin/user', async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    // 회원 정보 삭제
    const userRef = db.collection('users').doc(phoneNumber);
    await userRef.delete();

    // 회원의 모든 예약 정보 삭제
    const reservationsSnapshot = await db.collection('reservations').where('phoneNumber', '==', phoneNumber).get();
    const batch = db.batch();
    reservationsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.status(200).send({ message: '회원 정보가 삭제되었습니다.' });
  } catch (error) {
    res.status(400).send({ error: '회원 삭제에 실패했습니다.', details: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
