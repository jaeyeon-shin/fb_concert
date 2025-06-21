// src/utils/checkAuthWithToken.js
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * ownerToken을 Firestore에서 가져와 localStorage에 저장하고,
 * 접속자가 해당 토큰을 가진 경우에만 true 반환
 * 그렇지 않으면 false 반환하여 접근을 제한함
 */
export default async function checkAuthWithToken(userId) {
  try {
    // localStorage에 이미 token이 있는지 확인
    const savedToken = localStorage.getItem(`token-${userId}`);

    if (savedToken) {
      // ✅ 이미 1회 접속한 적이 있음 → 접근 허용
      return true;
    }

    // 🔄 Firestore에서 토큰 불러오기
    const docRef = doc(db, 'records', userId);
    const snap = await getDoc(docRef);

    if (snap.exists() && snap.data().ownerToken) {
      const token = snap.data().ownerToken;

      // 📥 처음 접속한 경우, localStorage에 저장하여 재접속 차단 기준 마련
      localStorage.setItem(`token-${userId}`, token);
      return true;
    }

    // ❌ 문서가 없거나 토큰이 없음
    return false;
  } catch (err) {
    console.error('인증 검사 중 오류 발생:', err);
    return false;
  }
}
