// src/utils/checkAuth.js

// Firestore에서 데이터를 읽기 위한 함수들 import
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * 🔐 checkAuth - 사용자의 접근 권한을 확인하는 함수
 * 
 * @param {string} userId - Firestore에 저장된 문서의 ID (NFC UUID)
 * @returns {Promise<boolean>} - 인증 성공 여부
 */
export default async function checkAuth(userId) {
  try {
    // Firestore에서 해당 UUID 문서 가져오기
    const docRef = doc(db, "records", userId);
    const docSnap = await getDoc(docRef);

    // 문서가 존재하지 않으면 인증 실패
    if (!docSnap.exists()) {
      return false;
    }

    // Firestore에서 ownerToken 가져오기
    const record = docSnap.data();
    const ownerToken = record.ownerToken;

    // 브라우저의 localStorage에 저장된 accessToken 가져오기
    const accessToken = localStorage.getItem("accessToken");

    // 토큰이 일치하면 인증 성공, 아니면 실패
    return ownerToken && accessToken && ownerToken === accessToken;
  } catch (err) {
    console.error("checkAuth 오류:", err);
    return false;
  }
}
