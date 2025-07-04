import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// firebase-admin 초기화
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
  const { slug } = req.query;
  console.log("📡 clearToken 요청:", slug);

  if (!slug) {
    console.log("🚫 slug is missing in query");
    return res.status(400).json({ error: 'slug is required' });
  }

  try {
    const docRef = db.collection('records').doc(slug);

    await docRef.update({
      ownerToken: FieldValue.delete(),
    });

    console.log(`✅ ownerToken cleared for ${slug}`);
    return res.status(200).json({ success: true, message: `Token cleared for ${slug}` });
  } catch (error) {
    console.error('🔥 Firestore token 삭제 실패:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
