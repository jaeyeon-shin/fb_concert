// src/utils/checkAuthWithToken.js
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * 🔐 checkAuthWithToken
 * Firestore의 ownerToken과 localStorage 토큰 비교
 *
 * @param {string} slug - Firestore 문서 ID
 * @param {string} token - localStorage 저장된 토큰
 * @returns {Promise<boolean>} 인증 성공 여부
 */
export default async function checkAuthWithToken(slug, token) {
  try {
    const docRef = doc(db, "records", slug);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      console.log("🚫 Firestore 문서 없음:", slug);
      return false;
    }

    const data = snap.data();
    if (!data.ownerToken || data.ownerToken !== token) {
      console.log("🚫 Firestore ownerToken 불일치:", slug);
      return false;
    }

    console.log("✅ 인증 성공:", slug);
    return true;
  } catch (err) {
    console.error("❌ 인증 확인 오류:", err);
    return false;
  }
}
