import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import generateOwnerToken from '../utils/generateOwnerToken';

/**
 * 🔐 Firestore에 새로운 ownerToken을 nonce 기반으로 강제 발급
 * - 이 함수는 NFC 태깅 직후에만 실행돼야 함
 * - nonce는 서버에서 미리 발급받은 값이어야 함
 */
export async function generateAndSaveOwnerToken(nfcId, nonce) {
  try {
    if (!nonce) {
      console.error("❌ 유효하지 않은 nonce");
      return null;
    }

    // ✅ 새 토큰 생성
    const newToken = generateOwnerToken();

    // ✅ Firestore에 강제 저장 (기존 토큰 덮어쓰기 허용)
    const docRef = doc(db, 'records', nfcId);
    await setDoc(docRef, { ownerToken: newToken }, { merge: true });

    // ✅ 로컬 저장
    localStorage.setItem(`authToken-${nfcId}`, newToken);

    console.log(`✅ 토큰 발급 완료: ${newToken}`);
    return newToken;
  } catch (err) {
    console.error('❌ 토큰 발급 중 오류 발생:', err);
    return null;
  }
}
