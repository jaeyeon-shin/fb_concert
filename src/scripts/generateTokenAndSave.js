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
    const newToken = generateOwnerToken();

    const docRef = doc(db, 'records', nfcId);
    await setDoc(docRef, { ownerToken: newToken }, { merge: true }); // Firestore 덮어쓰기

    localStorage.setItem(`ownerToken-${nfcId}`, newToken); // 브라우저에 저장
    alert(`🔑 새 토큰 발급 완료: ${newToken}`);
    console.log(`✅ Firestore 토큰 갱신 완료 for ${nfcId}: ${newToken}`);

    return newToken;
  } catch (err) {
    console.error('🔥 토큰 발급 실패:', err);
    alert('❌ ownerToken 생성 중 오류 발생');
    return null;
  }
}
