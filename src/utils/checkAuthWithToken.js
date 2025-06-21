// src/utils/checkAuthWithToken.js
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default async function checkAuthWithToken(userId) {
  const sessionToken = sessionStorage.getItem(`token-${userId}`); // 세션 저장된 토큰 불러오기

  // Firestore에서 해당 userId의 ownerToken 가져오기
  const docRef = doc(db, 'records', userId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) return false;

  const firestoreToken = snap.data().ownerToken;
  if (!firestoreToken) return false;

  // 세션 토큰이 이미 존재하고 일치하면 통과
  if (sessionToken && sessionToken === firestoreToken) {
    return true;
  }

  // 세션에 토큰이 없을 경우, Firestore의 토큰을 저장 (최초 인증 성공 시)
  sessionStorage.setItem(`token-${userId}`, firestoreToken);
  return true;
}
