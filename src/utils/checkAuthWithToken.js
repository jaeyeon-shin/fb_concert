// 📁 utils/checkAuthWithToken.js
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * ownerToken 인증 확인 함수
 * @param {string} userId - 유저 ID (ex: NFC UUID)
 * @param {string|null} overrideToken - 직접 전달받은 토큰 (localStorage 대신 사용 가능)
 * @returns {Promise<boolean>} - 인증 성공 여부
 */
export default async function checkAuthWithToken(userId, overrideToken = null) {
  const docRef = doc(db, 'records', userId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) return false;

  const firestoreToken = snap.data().ownerToken;
  const localToken = overrideToken || localStorage.getItem(`authToken-${userId}`);

  // 🔐 토큰 자체가 없거나 일치하지 않으면 인증 실패
  if (!firestoreToken || !localToken || localToken !== firestoreToken) {
    return false;
  }

  // ✅ 토큰이 일치하면 인증 성공
  return true;
}
