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

  // ✅ 최초 인증 후 내부 이동만 허용하는 세션 플래그 확인
  const sessionAllowed = localStorage.getItem(`auth-ok-${userId}`) === 'true';

  // 🔒 Firestore 토큰이 아예 없거나 토큰 불일치 시 실패
  if (!firestoreToken || !localToken || localToken !== firestoreToken) {
    return false;
  }

  // ✅ 인증 성공 → 세션 플래그가 있어야만 진입 허용
  return sessionAllowed;
}
