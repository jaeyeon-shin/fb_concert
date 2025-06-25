// api/verifyNonceAndIssueToken.js

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

// ✅ 환경 변수 확인 및 파싱
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKeyRaw) {
  console.error('❌ 환경변수 누락:', { projectId, clientEmail, privateKeyRaw });
  throw new Error('Firebase Admin 환경변수가 누락되었습니다.');
}

const privateKey = privateKeyRaw.replace(/\\n/g, '\n'); // 🔥 줄바꿈 복원

// ✅ Firebase Admin SDK 초기화
if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const db = getFirestore();

/**
 * 🔐 nonce 검증 후, 토큰 발급 & 저장
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { nfcId, nonce } = req.body;

  if (!nfcId || !nonce) {
    return res.status(400).json({ message: 'Missing nfcId or nonce' });
  }

  try {
    const docRef = db.collection('nonces').doc(nfcId);
    const snap = await docRef.get();

    if (!snap.exists() || snap.data().nonce !== nonce) {
      return res.status(403).json({ message: 'Invalid or expired nonce' });
    }

    // ✅ nonce 유효 → 삭제
    await docRef.delete();

    // 🔐 새 토큰 발급
    const newToken = randomUUID();

    // 🔐 records 문서에 저장
    await db.collection('records').doc(nfcId).set(
      { ownerToken: newToken },
      { merge: true }
    );

    return res.status(200).json({ token: newToken });
  } catch (err) {
    console.error('❌ 토큰 발급 실패:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
