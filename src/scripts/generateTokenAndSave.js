import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import generateOwnerToken from '../utils/generateOwnerToken';

/**
 * 🔐 Firestore에 새로운 ownerToken을 nonce 기반으로 강제 발급
 * - 이 함수는 NFC 태깅 직후에만 실행돼야 함
 * - nonce는 서버에서 미리 발급받은 값이어야 함
 */
export async function generateAndSaveOwnerToken(nfcId, nonce) {
    try {
      const res = await fetch('/api/verifyNonceAndIssueToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfcId, nonce }),
      });
  
      if (!res.ok) {
        console.error("🚫 토큰 발급 실패:", await res.text());
        return null;
      }
  
      const { token } = await res.json();
  
      if (token) {
        localStorage.setItem(`authToken-${nfcId}`, token);
        return token;
      } else {
        return null;
      }
    } catch (err) {
      console.error("🔥 토큰 발급 중 오류 발생:", err);
      return null;
    }
  }
  