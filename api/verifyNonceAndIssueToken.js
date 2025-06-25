import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

// 🔐 환경변수에서 서비스 계정 정보 로드
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY_JSON);

// ✅ Firebase Admin SDK 초기화 (중복 방지)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      ...serviceAccount,
      private_key: serviceAccount.private_key.replace(/\\n/g, '\n'), // 🔥 줄바꿈 복원
    }),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  // 🔒 POST 방식만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { nfcId, nonce } = req.body;

  // 🔍 입력 유효성 확인
  if (!nfcId || !nonce) {
    return res.status(400).json({ message: 'Missing nfcId or nonce' });
  }

  try {
    // 🔐 해당 nonce 문서 가져오기
    const docRef = db.collection('nonces').doc(nfcId);
    const snap = await docRef.get();

    // ⛔ 유효하지 않은 nonce → 거부
    if (!snap.exists() || snap.data().nonce !== nonce) {
      return res.status(403).json({ message: 'Invalid or expired nonce' });
    }

    // ✅ nonce 사용 후 삭제 (1회용 보장)
    await docRef.delete();

    // ✅ 토큰 새로 생성 (UUID 기반)
    const newToken = randomUUID();

    // ✅ Firestore의 records 문서에 토큰 저장 (merge 유지)
    await db.collection('records').doc(nfcId).set(
      { ownerToken: newToken },
      { merge: true }
    );

    // 🎉 클라이언트로 토큰 반환
    return res.status(200).json({ token: newToken });
  } catch (err) {
    console.error('❌ 토큰 발급 실패:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
