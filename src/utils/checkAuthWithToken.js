// src/utils/checkAuthWithToken.js

import { db } from '../firebase';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';

/**
 * ownerToken 인증 확인 함수
 * @param {string} userId - 유저 ID (ex: NFC UUID)
 * @param {string|null} overrideToken - (옵션) 직접 전달받은 토큰 (localStorage 대신 사용됨)
 * @returns {Promise<boolean>} - 인증 성공 여부 반환
 */
export default async function checkAuthWithToken(userId, overrideToken = null) {
  // 1️⃣ Firestore에서 해당 유저의 문서 가져오기
  const docRef = doc(db, 'records', userId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return false; // ❌ 문서 없으면 실패

  const firestoreToken = snap.data().ownerToken;

  // 2️⃣ 인증 비교 대상: overrideToken > localStorage의 authToken
  const localToken = overrideToken || localStorage.getItem(`authToken-${userId}`);

  // 3️⃣ 토큰이 없거나 일치하지 않으면 인증 실패
  if (!localToken || localToken !== firestoreToken) return false;

  // 4️⃣ 인증 성공 → 재접속 방지를 위해 Firestore에서 토큰 삭제
  await updateDoc(docRef, {
    ownerToken: deleteField()
  });

  return true; // ✅ 인증 성공
}
