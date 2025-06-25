import { randomUUID } from 'crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  let serviceAccount;

  if (process.env.SERVICE_ACCOUNT_KEY_BASE64) {
    const decoded = Buffer.from(process.env.SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8');
    serviceAccount = JSON.parse(decoded.replace(/\\n/g, '\n'));
  } else if (process.env.SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'));
  } else {
    throw new Error('No Firebase service account credentials provided');
  }

  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

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
