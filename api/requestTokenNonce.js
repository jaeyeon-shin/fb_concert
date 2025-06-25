// 📁 /api/requestTokenNonce.js
// ✅ Firebase Admin SDK를 이용해 nonce 값을 발급하고 Firestore에 저장하는 API

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

// ✅ 환경변수에서 JSON 형태의 서비스 계정 정보 불러오기
// (FIREBASE_ADMIN_KEY_JSON은 문자열이므로 반드시 JSON.parse 필요)
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

// ✅ Firebase Admin SDK 초기화 (재초기화 방지)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      ...serviceAccount,
      private_key: serviceAccount.private_key.replace(/\\n/g, '\n'), // 🔥 줄바꿈 복원
    }),
  });
}

// ✅ Firestore 인스턴스 가져오기
const db = getFirestore();

export default async function handler(req, res) {
  // ✅ POST 메소드만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // ✅ 클라이언트로부터 nfcId 받기
  const { nfcId } = req.body;

  if (!nfcId) {
    return res.status(400).json({ message: 'Missing nfcId' });
  }

  try {
    // ✅ 고유한 nonce 생성 (UUID 기반)
    const nonce = randomUUID();

    // ✅ Firestore에 저장 (문서 ID = nfcId)
    await db.collection('nonces').doc(nfcId).set({
      nonce,
      createdAt: Date.now(),
    });

    // ✅ 클라이언트에 nonce 반환
    res.status(200).json({ nonce });
  } catch (err) {
    console.error('🔥 nonce 발급 실패:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
