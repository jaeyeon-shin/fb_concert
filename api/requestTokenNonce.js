// 📁 /api/requestTokenNonce.js

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

// 🔐 환경변수에서 서비스 계정 키 불러오기 (Vercel에 저장 필요)
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY || '{}');

// Firebase Admin 초기화 (중복 방지)
if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
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
    await db.collection('nonces').doc(nfcId).set({
      nonce,
      createdAt: Date.now(),
    });

    return res.status(200).json({ nonce });
  } catch (err) {
    console.error('🔥 nonce 저장 실패:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}