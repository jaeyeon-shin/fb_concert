import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

// Firebase Admin 초기화
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

// ⚠️ Vercel 환경에서는 req.body 직접 파싱해야 함
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { nfcId, nonce } = await parseBody(req);

    if (!nfcId || !nonce) {
      return res.status(400).json({ message: 'Missing nfcId or nonce' });
    }

    const docRef = db.collection('nonces').doc(nfcId);
    const snap = await docRef.get();

    if (!snap.exists() || snap.data().nonce !== nonce) {
      return res.status(403).json({ message: 'Invalid or expired nonce' });
    }

    await docRef.delete(); // nonce 제거

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
