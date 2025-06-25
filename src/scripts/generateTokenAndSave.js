// 📁 scripts/generateTokenAndSave.js
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import generateOwnerToken from '../utils/generateOwnerToken';

/**
 * 🔐 서버에서 받은 nonce가 있어야만 토큰 발급이 가능
 */
export async function generateAndSaveOwnerToken(nfcId, nonce) {
  try {
    const nonceDocRef = doc(db, 'nonces', nfcId);
    const nonceSnap = await getDoc(nonceDocRef);

    const serverNonce = nonceSnap.exists() ? nonceSnap.data().value : null;

    // ⛔ nonce 없거나 불일치 → 태깅 아닌 접근
    if (!serverNonce || serverNonce !== nonce) {
      alert('🚫 유효하지 않은 접근입니다 (태깅 인증 실패)');
      return null;
    }

    const docRef = doc(db, 'records', nfcId);
    const snap = await getDoc(docRef);

    // ✅ 토큰 생성 및 저장
    const newToken = generateOwnerToken();
    await setDoc(docRef, { ownerToken: newToken }, { merge: true });

    // ✅ 인증용 정보 로컬 저장
    localStorage.setItem(`authToken-${nfcId}`, newToken);
    localStorage.setItem(`auth-ok-${nfcId}`, 'true');

    console.log(`✅ 새 토큰 발급 완료 for ${nfcId}: ${newToken}`);
    return newToken;
  } catch (err) {
    console.error('🔥 토큰 발급 실패:', err);
    alert('❌ 토큰 발급 중 오류 발생');
    return null;
  }
}
