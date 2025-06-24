// src/scripts/generateTokenAndSave.js

// 🔧 Firebase Firestore 인스턴스 import
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

// 🔐 토큰 생성 함수 import
import generateOwnerToken from '../utils/generateOwnerToken';

/**
 * 🎫 ownerToken을 localStorage와 Firestore에 자동 발급 및 저장
 * 1. localStorage에 토큰이 이미 있으면 그대로 사용
 * 2. 없으면 새로 생성 → Firestore 저장 → localStorage에도 저장
 * 
 * @param {string} nfcId - Firestore 문서 키로 사용하는 UUID
 * @returns {string|null} 생성된 토큰 또는 실패 시 null
 */
export async function generateAndSaveOwnerToken(nfcId) {
  try {
    // 📦 1. 브라우저에 기존 토큰 있는지 확인
    let existingToken = localStorage.getItem(`ownerToken-${nfcId}`);
    if (existingToken) {
      console.log(`📦 기존 토큰 사용: ${existingToken}`);
      return existingToken;
    }

    // 🔐 2. 새로운 토큰 생성
    const newToken = generateOwnerToken();

    // 💾 3. Firestore에 저장
    const docRef = doc(db, 'records', nfcId);
    await setDoc(
      docRef,
      { ownerToken: newToken },
      { merge: true } // 기존 필드 유지하며 병합
    );

    // 💽 4. 브라우저 localStorage에도 저장
    localStorage.setItem(`ownerToken-${nfcId}`, newToken);

    // ✅ 5. 성공 알림 (모바일 디버깅용)
    alert(`✅ 토큰 저장 완료: ${newToken}`);
    console.log(`✅ ${nfcId}에 토큰 저장 완료: ${newToken}`);
    return newToken;

  } catch (err) {
    // ⛔ 실패 처리
    alert(`❌ 토큰 저장 실패: ${err.message}`);
    console.error('🔥 ownerToken 저장 실패:', err);
    return null;
  }
}
