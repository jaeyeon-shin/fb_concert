// src/scripts/generateTokenAndSave.js
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import generateOwnerToken from '../utils/generateOwnerToken';

/**
 * 🔐 매번 새로운 토큰을 생성하고 Firestore + localStorage에 저장
 * 이전 토큰은 무효화됨 → 완전 일회성 인증 보장
 */
export async function generateAndSaveOwnerToken(nfcId) {
  try {
    const newToken = generateOwnerToken(); // 1️⃣ 랜덤한 토큰 생성

    const docRef = doc(db, 'records', nfcId);

    // 2️⃣ Firestore에 ownerToken 필드 저장 (병합 모드)
    await setDoc(docRef, { ownerToken: newToken }, { merge: true });

    // 3️⃣ 로컬 브라우저에도 저장 (checkAuthWithToken에서 읽기 위함)
    localStorage.setItem(`ownerToken-${nfcId}`, newToken);  // 🔸 참고용 (선택)
    localStorage.setItem(`authToken-${nfcId}`, newToken);   // ✅ 실제 인증용

    // ✅ 디버깅 및 피드백용 로그 및 알림
    alert(`🔑 새 토큰 발급 완료: ${newToken}`);
    console.log(`✅ Firestore 토큰 갱신 완료 for ${nfcId}: ${newToken}`);

    return newToken;
  } catch (err) {
    console.error('🔥 토큰 발급 실패:', err);
    alert('❌ ownerToken 생성 중 오류 발생');
    return null;
  }
}
