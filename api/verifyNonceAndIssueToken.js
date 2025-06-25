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
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    try {
      // ✅ POST body 수동 파싱 (Vercel에서는 필요함)
      const body = JSON.parse(await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(data));
        req.on('error', err => reject(err));
      }));
  
      const { nfcId, nonce } = body;
  
      if (!nfcId || !nonce) {
        return res.status(400).json({ message: 'Missing nfcId or nonce' });
      }
  
      const docRef = db.collection('nonces').doc(nfcId);
      const snap = await docRef.get();
  
      if (!snap.exists() || snap.data().nonce !== nonce) {
        return res.status(403).json({ message: 'Invalid or expired nonce' });
      }
  
      // ✅ nonce 유효 → 삭제 후 토큰 발급
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
  