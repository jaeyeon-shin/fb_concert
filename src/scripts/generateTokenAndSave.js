import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import generateOwnerToken from '../utils/generateOwnerToken';

/**
 * 🔐 Firestore에 새로운 ownerToken을 nonce 기반으로 강제 발급
 * - 이 함수는 NFC 태깅 직후에만 실행돼야 함
 * - nonce는 서버에서 미리 발급받은 값이어야 함
 */
// generateAndSaveOwnerToken.js
export async function generateAndSaveOwnerToken(userId, nonce) {
    try {
      const response = await fetch('/api/verifyNonceAndIssueToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfcId: userId, nonce }),
      });
  
      const data = await response.json();
      console.log('🔍 verifyNonceAndIssueToken 응답:', data); // 👉 이거 추가
  
      return data.token;
    } catch (err) {
      console.error('❌ 토큰 발급 요청 실패:', err); // 👉 이거도 추가
      return null;
    }
  }
  