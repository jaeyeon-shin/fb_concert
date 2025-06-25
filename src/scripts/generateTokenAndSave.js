import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import generateOwnerToken from '../utils/generateOwnerToken';

/**
 * 🔐 Firestore에 ownerToken이 없을 때만 새로운 토큰을 생성 및 저장
 * → 이미 토큰이 있으면 다른 사람이 접속 중이라는 의미 → 접속 차단
 */
export async function generateAndSaveOwnerToken(nfcId) {
  try {
    const docRef = doc(db, 'records', nfcId);
    const snap = await getDoc(docRef);

    // 1️⃣ 이미 토큰이 존재하면 (누군가 접속 중), 재발급 차단
    if (snap.exists() && snap.data().ownerToken) {
      console.warn("⛔ 이미 발급된 토큰이 있음. 중복 접속 차단.");
      return null; // 접속 거부
    }

    // 2️⃣ 새 랜덤 토큰 생성
    const newToken = generateOwnerToken();

    // 3️⃣ Firestore에 토큰 저장 (merge 모드로 나머지 필드는 유지)
    await setDoc(docRef, { ownerToken: newToken }, { merge: true });

    // 4️⃣ 로컬에도 인증용 토큰 저장 (하위 페이지 접근용)
    localStorage.setItem(`authToken-${nfcId}`, newToken);

    // ✅ 디버깅용
    console.log(`✅ 새 토큰 발급 완료 for ${nfcId}: ${newToken}`);
    alert(`🔑 새 토큰 발급 완료: ${newToken}`);

    return newToken;
  } catch (err) {
    console.error('🔥 토큰 발급 실패:', err);
    alert('❌ ownerToken 생성 중 오류 발생');
    return null;
  }
}
