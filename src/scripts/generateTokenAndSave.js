// 📁 scripts/generateTokenAndSave.js
import { db } from '../firebase';
import { doc, getDoc, setDoc, deleteField } from 'firebase/firestore';
import generateOwnerToken from '../utils/generateOwnerToken';

/**
 * 🔐 항상 새 토큰을 발급하고 덮어씌움 (즉, 이전 토큰 제거)
 * → NFC 태깅이 트리거된 경우에만 호출되므로, 매번 접속 허용
 */
export async function generateAndSaveOwnerToken(nfcId) {
  try {
    const docRef = doc(db, 'records', nfcId);

    // 1️⃣ 새 랜덤 토큰 생성
    const newToken = generateOwnerToken();

    // 2️⃣ Firestore에 토큰 덮어쓰기 (이전 토큰 제거)
    await setDoc(docRef, { ownerToken: newToken }, { merge: true });

    // 3️⃣ 로컬 스토리지에도 저장 (하위 페이지 접근 가능하도록)
    localStorage.setItem(`authToken-${nfcId}`, newToken);
    localStorage.setItem(`auth-ok-${nfcId}`, 'true'); // 👉 내부 페이지 접근 허용

    // ✅ 디버깅용
    console.log(`✅ 새 토큰 발급 완료 for ${nfcId}: ${newToken}`);

    return newToken;
  } catch (err) {
    console.error('🔥 토큰 발급 실패:', err);
    return null;
  }
}
