// 📁 /api/requestTokenNonce.js

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { randomUUID } from 'crypto';

// Firebase 초기화 (재초기화 방지)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

/**
 * ✅ 이 API는 NFC 태깅 직후 클라이언트가 호출
 * - Firestore에 "nonce" 값을 발급 & 저장 (유효기간: 클라이언트 판단)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { nfcId } = req.body;

  if (!nfcId) {
    return res.status(400).json({ message: 'Missing nfcId' });
  }

  try {
    const nonce = randomUUID(); // 고유 nonce 생성
    await setDoc(doc(db, 'nonces', nfcId), { nonce, createdAt: Date.now() });
    return res.status(200).json({ nonce });
  } catch (err) {
    console.error('🔥 nonce 저장 실패:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
