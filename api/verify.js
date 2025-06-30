import { randomUUID } from 'crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// 🔥 Firebase Admin 초기화
try {
  if (!getApps().length) {
    let serviceAccount;

    if (process.env.SERVICE_ACCOUNT_KEY_BASE64) {
      console.log("✅ SERVICE_ACCOUNT_KEY_BASE64 존재");
      const decoded = Buffer.from(process.env.SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decoded.replace(/\\n/g, '\n'));
    } else if (process.env.SERVICE_ACCOUNT_KEY) {
      console.log("✅ SERVICE_ACCOUNT_KEY 존재");
      serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'));
    } else {
      console.error("❌ Firebase 서비스 계정 환경변수 없음");
      throw new Error('No Firebase service account credentials provided');
    }

    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log("🚀 Firebase Admin 초기화 완료");
  }
} catch (err) {
  console.error("🔥 Firebase Admin 초기화 실패:", err);
}

const db = getFirestore();

// 🔥 실제 API 핸들러
export default async function handler(req, res) {
  console.log("📩 /api/verify 호출됨");
  
  if (req.method !== 'POST') {
    console.log("🚫 잘못된 메서드:", req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { slug } = req.body;
  console.log("👉 받은 slug:", slug);

  if (!slug) {
    console.log("🚫 slug 없음");
    return res.status(400).json({ message: 'Missing slug' });
  }

  try {
    const docRef = db.collection('records').doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.log("🚫 Firestore 문서 없음:", slug);
      return res.status(404).json({ message: 'Invalid NFC slug' });
    }

    const data = docSnap.data();
    console.log("✅ Firestore 데이터:", data);

    // 🔥 이미 토큰 존재하면 차단
    if (data.ownerToken) {
      console.log("🚫 이미 ownerToken 존재:", data.ownerToken);
      return res.status(403).json({ message: 'Already accessed. Please retag NFC.' });
    }

    // ✅ 새 토큰 발급
    const newToken = randomUUID();
    console.log("🎫 새 토큰 발급:", newToken);

    await docRef.update({
      ownerToken: newToken,
      accessedAt: Date.now(),
    });

    console.log("✅ Firestore 토큰 업데이트 완료");
    return res.status(200).json({ token: newToken, nfcId: data.nfcId });
  } catch (err) {
    console.error('❌ API 내부 오류:', err);
    // JSON 실패 방지
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}
