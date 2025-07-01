import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * 🔐 checkAuthWithToken
 * Firestore에 저장된 ownerToken과 localStorage 토큰 비교
 */
export default async function checkAuthWithToken(slug, token) {
  try {
    console.log("🔍 checkAuthWithToken 진입:", { slug, token });

    if (!slug || !token) {
      console.log("🚫 slug 또는 token 없음 => 인증 실패");
      return false;
    }

    const docRef = doc(db, "records", slug);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      console.log("🚫 Firestore 문서 없음:", slug);
      return false;
    }

    const data = snap.data();
    if (!data.ownerToken) {
      console.log("🚫 Firestore에 ownerToken 없음:", slug);
      return false;
    }

    if (data.ownerToken !== token) {
      console.log("🚫 ownerToken 불일치:", {
        slug,
        firestoreToken: data.ownerToken,
        localToken: token
      });
      return false;
    }

    console.log("✅ 인증 성공:", slug);
    return true;
  } catch (err) {
    console.error("❌ checkAuthWithToken 오류:", err);
    return false;
  }
}
