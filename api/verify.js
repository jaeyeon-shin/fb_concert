import { randomUUID } from 'crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  const decoded = Buffer.from(process.env.SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8');
  const serviceAccount = JSON.parse(decoded);

  console.log("✅ Firebase Admin Initialized");
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.log("🚫 Invalid method:", req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { slug } = req.body;
  console.log("📡 verify 요청 slug:", slug);

  if (!slug) {
    console.log("🚫 Missing slug in body");
    return res.status(400).json({ message: 'Missing slug' });
  }

  try {
    const docRef = db.collection('records').doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.log("🚫 No Firestore doc found for:", slug);
      return res.status(404).json({ message: 'Invalid NFC slug' });
    }

    const data = docSnap.data();
    console.log("🔍 Firestore data:", data);

    if (data.ownerToken) {
      console.log("🚫 Already accessed:", slug);
      return res.status(403).json({ message: 'Already accessed. Please retag NFC.' });
    }

    const newToken = randomUUID();
    await docRef.update({
      ownerToken: newToken,
      accessedAt: Date.now(),
    });

    console.log(`✅ New ownerToken issued for ${slug}:`, newToken);

    return res.status(200).json({ token: newToken, nfcId: data.nfcId });
  } catch (err) {
    console.error('🔥 verify server error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
