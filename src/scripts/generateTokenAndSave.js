// src/scripts/generateTokenAndSave.js
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import generateOwnerToken from '../utils/generateOwnerToken';

/**
 * 🔐 토큰을 생성하고 Firestore + localStorage에 저장
 * 단, 기존에 유효한 토큰(ownerToken)이 Firestore에 이미 존재하면
 * 재접속으로 간주하고 새 토큰을 발급하지 않음
 *
 * @param {string} nfcId - NFC UUID 또는 사용자 ID
 * @returns {Promise<string|null>} - 새로 발급된 토큰 (또는 실패 시 null)
 */
export async function generateAndSaveOwnerToken(nfcId) {
  try {
    const docRef = doc(db, 'records', nfcId);
    const snap = await getDoc(docRef);

    // 1️⃣ 기존 토큰 존재 시 새로 발급하지 않음 (재접속으로 판단)
    if (snap.exists() && snap.data().ownerToken) {
      console.warn('🚫 기존 토큰이 존재 → 새 토큰 발급하지 않음');
      return null;
    }

    // 2️⃣ 새 토큰 생성
    const newToken = generateOwnerToken();

    // 3️⃣ Firestore에 ownerToken 저장 (기존 문서에 병합)
    await setDoc(docRef, { ownerToken: newToken }, { merge: true });

    // 4️⃣ 로컬 브라우저에도 저장 (checkAuthWithToken에서 사용됨)
    localStorage.setItem(`authToken-${nfcId}`, newToken);   // ✅ 실제 인증용
    localStorage.setItem(`ownerToken-${nfcId}`, newToken);  // 🔸 참고용 (UI 디버깅 시 사용)

    // ✅ 로그 및 알림
    alert(`🔑 새 토큰 발급 완료: ${newToken}`);
    console.log(`✅ Firestore 토큰 저장 완료 for ${nfcId}: ${newToken}`);

    return newToken;
  } catch (err) {
    console.error('🔥 토큰 발급 실패:', err);
    alert('❌ ownerToken 생성 중 오류 발생');
    return null;
  }
}
