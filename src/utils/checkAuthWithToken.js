import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * 🔐 checkAuthWithToken
 * Firestore에 저장된 ownerToken과 localStorage 토큰 비교
 */
export default async function checkAuthWithToken(slug, token) {
  try {
    console.log("🔍 checkAuthWithToken 실행:", { slug, token });

    if (!slug || !token) {
      console.log("🚫 [FAIL] slug 또는 token이 없습니다 → 인증 실패");
      return false;
    }

    const docRef = doc(db, "records", slug);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      console.log("🚫 [FAIL] Firestore 문서가 없습니다:", slug);
      return false;
    }

    const data = snap.data();
    console.log("📦 Firestore 데이터:", data);

    if (!data.ownerToken) {
      console.log("🚫 [FAIL] Firestore에 ownerToken이 없습니다:", slug);
      return false;
    }

    if (data.ownerToken !== token) {
      console.log("🚫 [FAIL] ownerToken 불일치:", {
        slug,
        firestoreToken: data.ownerToken,
        localToken: token
      });
      return false;
    }

    console.log("✅ [SUCCESS] 인증 통과:", slug);
    return true;
  } catch (err) {
    console.error("🔥 [ERROR] checkAuthWithToken 실행 중 오류:", err);
    return false;
  }
}
