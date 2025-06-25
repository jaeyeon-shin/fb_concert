import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

// ✅ 환경변수에서 JSON 문자열 파싱
const raw = process.env.SERVICE_ACCOUNT_KEY;
if (!raw) throw new Error('❌ SERVICE_ACCOUNT_KEY 환경변수가 비어있습니다.');

const serviceAccount = JSON.parse(raw);

if (!getApps().length) {
  initializeApp({
    credential: cert({
      ...serviceAccount,
      private_key: serviceAccount.private_key.replace(/\\n/g, '\n'), // 🔥 복원 중요!
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
