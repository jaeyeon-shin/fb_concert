import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './fb-concert-firebase-adminsdk-fbsvc-c211026dc7.json';
import { randomUUID } from 'crypto';

// ✅ Firebase Admin 초기화 (이미 초기화된 경우 방지)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      ...serviceAccount,
      private_key: serviceAccount.private_key.replace(/\\n/g, '\n'), // 🔥 줄바꿈 처리 중요
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
