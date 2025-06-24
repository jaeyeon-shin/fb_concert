// src/scripts/generateTokenAndSave.js
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import generateOwnerToken from '../utils/generateOwnerToken';

export async function generateAndSaveOwnerToken(nfcId) {
  // 토큰 생성
  const ownerToken = generateOwnerToken();

  // Firestore에 저장
  const docRef = doc(db, 'records', nfcId);
  await setDoc(
    docRef,
    { ownerToken }, // 기존 필드는 그대로 두고 토큰만 병합
    { merge: true }
  );

  console.log(`✅ ${nfcId}에 토큰 저장 완료: ${ownerToken}`);

  return ownerToken; // 🔥🔥 반드시 추가!!
}
