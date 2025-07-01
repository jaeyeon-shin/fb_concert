import { randomUUID } from 'crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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

  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({ message: 'Missing slug' });
  }

  try {
    const docRef = db.collection('records').doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.log(`❌ [${slug}] Firestore 문서 없음`);
      return res.status(404).json({ message: 'Invalid NFC slug' });
    }

    const data = docSnap.data();

    if (data.ownerToken) {
      console.log(`🚫 [${slug}] 이미 ownerToken 존재: ${data.ownerToken}`);
      return res.status(403).json({ message: 'Already accessed. Please retag NFC.' });
    }

    const newToken = randomUUID();

    await docRef.update({
      ownerToken: newToken,
      accessedAt: FieldValue.serverTimestamp(),
    });

    console.log(`✅ [${slug}] 새 토큰 발급 완료: ${newToken}`);

    return res.status(200).json({ token: newToken, nfcId: data.nfcId });
  } catch (err) {
    console.error('❌ Token issue failed:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
