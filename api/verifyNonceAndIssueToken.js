// 📁 /api/verifyNonceAndIssueToken.js

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

// ✅ 환경변수에서 JSON 문자열을 안전하게 파싱
let serviceAccount;
try {
  const raw = process.env.SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("FIREBASE_ADMIN_KEY_JSON is undefined");
  serviceAccount = JSON.parse(raw);
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
} catch (err) {
  console.error("🔥 Firebase Admin Key JSON 파싱 실패:", err);
  throw err;
}

// ✅ Firebase Admin 초기화
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

// ✅ 토큰 발급 API
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

    // ✅ 유효한 nonce → 삭제하고 ownerToken 발급
    await docRef.delete();

    const newToken = randomUUID();
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
