// api/clearToken.js

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// ✅ Firebase Admin SDK 초기화
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

/**
 * 🔐 Firestore의 ownerToken을 제거하는 서버 함수
 * 요청: /api/clearToken?nfcId=04A2EC12361E90
 */
export default async function handler(req, res) {
  const { nfcId } = req.query;

  if (!nfcId) {
    return res.status(400).json({ error: 'nfcId is required' });
  }

  try {
    const docRef = db.collection('records').doc(nfcId);
    await docRef.update({
      ownerToken: FieldValue.delete(), // ✅ 여기 수정됨!
    });

    return res.status(200).json({ success: true, message: `Token cleared for ${nfcId}` });
  } catch (error) {
    console.error('🔥 Firestore token 삭제 실패:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
