import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
  const serviceAccount = JSON.parse(
    process.env.SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n')
  );

  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  const { nfcId } = req.query;

  if (!nfcId) {
    return res.status(400).json({ error: 'nfcId is required' });
  }

  try {
    const docRef = db.collection('records').doc(nfcId);
    await docRef.update({
      ownerToken: FieldValue.delete(),
    });

    return res.status(200).json({ success: true, message: `Token cleared for ${nfcId}` });
  } catch (error) {
    console.error('🔥 Firestore token 삭제 실패:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
