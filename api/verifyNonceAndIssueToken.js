import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

// ✅ 환경변수에서 서비스 계정 JSON 파싱
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY_JSON);

if (!getApps().length) {
  initializeApp({
    credential: cert({
      ...serviceAccount,
      private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  // ✅ POST만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // ✅ Vercel 환경에서는 req.body 대신 req.json() 사용
    const { nfcId, nonce } = await req.json();

    if (!nfcId || !nonce) {
      return res.status(400).json({ message: 'Missing nfcId or nonce' });
    }

    const docRef = db.collection('nonces').doc(nfcId);
    const snap = await docRef.get();

    if (!snap.exists() || snap.data().nonce !== nonce) {
      return res.status(403).json({ message: 'Invalid or expired nonce' });
    }

    // ✅ 유효한 nonce → 삭제 & 토큰 발급
    await docRef.delete();

    const newToken = randomUUID();
    await db.collection('records').doc(nfcId).set(
      { ownerToken: newToken },
      { merge: true }
    );

    return res.status(200).json({ token: newToken });
  } catch (err) {
    console.error('❌ verifyNonceAndIssueToken 오류:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
