import { db } from '../firebase';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';

/**
 * 🔐 ownerToken 인증 확인 및 Firestore에서 토큰 제거
 * @param {string} userId - 유저 ID (ex: NFC UUID)
 * @param {string|null} overrideToken - (옵션) 직접 전달받은 토큰
 * @returns {Promise<boolean>} - 인증 성공 여부 반환
 */
export default async function checkAuthWithToken(userId, overrideToken = null) {
  try {
    const docRef = doc(db, 'records', userId);
    const snap = await getDoc(docRef);

    // 1️⃣ 문서가 존재하지 않으면 인증 실패
    if (!snap.exists()) return false;

    const firestoreToken = snap.data().ownerToken;

    // 2️⃣ 비교할 토큰: overrideToken > localStorage
    const localToken = overrideToken || localStorage.getItem(`authToken-${userId}`);

    // 3️⃣ 토큰이 없거나 일치하지 않으면 인증 실패
    if (!localToken || localToken !== firestoreToken) return false;

    // 4️⃣ 인증 성공 시 Firestore에서 토큰 제거 (한 번만 유효하게 만듦)
    await updateDoc(docRef, {
      ownerToken: deleteField(),
    });
    console.log(`🧹 Firestore 토큰 제거 완료 for ${userId}`);

    return true;
  } catch (err) {
    console.error("🔥 인증 실패 또는 Firestore 오류:", err);
    return false;
  }
}
