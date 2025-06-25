// ✅ /api/requestTokenNonce.js 파일에서의 오류 원인:
// 환경변수 SERVICE_ACCOUNT_KEY가 실제 JSON이 아니라 "문자열처럼 보이는 잘못된 값"이었음

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

// ✅ 환경변수에서 JSON 문자열 가져오기
const raw = process.env.SERVICE_ACCOUNT_KEY;

if (!raw) {
  throw new Error('❌ SERVICE_ACCOUNT_KEY 환경변수가 비어있습니다.');
}

// ✅ JSON 파싱 (여기서 문제가 나면 raw 자체가 잘못된 값)
let serviceAccount;
try {
  serviceAccount = JSON.parse(raw);
} catch (e) {
  console.error('❌ JSON 파싱 실패:', e);
  throw new Error('❌ SERVICE_ACCOUNT_KEY JSON 파싱 실패');
}

// ✅ Firebase Admin 초기화
if (!getApps().length) {
  initializeApp({
    credential: cert({
      ...serviceAccount,
      private_key: serviceAccount.private_key.replace(/\\n/g, '\n'), // 🔥 줄바꿈 복원 필수
    }),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { nfcId } = req.body;

  if (!nfcId) {
    return res.status(400).json({ message: 'Missing nfcId' });
  }

  try {
    const nonce = randomUUID();
    await db.collection('nonces').doc(nfcId).set({
      nonce,
      createdAt: Date.now(),
    });

    res.status(200).json({ nonce });
  } catch (err) {
    console.error('🔥 nonce 발급 실패:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
