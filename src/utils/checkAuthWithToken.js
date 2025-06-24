// src/utils/checkAuthWithToken.js
import { db } from '../firebase';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';

export default async function checkAuthWithToken(userId) {
  // 1️⃣ Firestore에서 해당 유저의 문서 가져오기
  const docRef = doc(db, 'records', userId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) return false; // 문서가 없으면 인증 실패

  const firestoreToken = snap.data().ownerToken;
  const localToken = localStorage.getItem(`authToken-${userId}`);

  // 2️⃣ localStorage에 토큰이 없거나 일치하지 않으면 인증 실패
  if (!localToken || localToken !== firestoreToken) return false;

  // 3️⃣ 인증 성공 → Firestore에서 ownerToken 필드 제거
  await updateDoc(docRef, {
    ownerToken: deleteField()
  });

  return true; // ✅ 인증 성공
}
