// Firebase SDK에서 필요한 함수들을 불러옴
import { initializeApp } from "firebase/app"; // Firebase 앱 초기화
import { getFirestore } from "firebase/firestore"; // Firestore 데이터베이스 기능 사용

// Firebase 프로젝트 설정 정보
// 실제 키 값은 보안상 .env 환경 변수에서 불러옴 (Vite의 import.meta.env를 사용)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // Firebase 인증용 API 키
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, // 인증 도메인
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, // Firebase 프로젝트 ID
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // (현재 미사용) Firebase Storage
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, // 메시지 발송 ID (주로 FCM용)
  appId: import.meta.env.VITE_FIREBASE_APP_ID, // Firebase 앱 고유 식별자
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Google Analytics 측정 ID (선택사항)
};

// 위의 설정 정보를 바탕으로 Firebase 앱을 초기화
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 객체를 생성해서 export (앱 전체에서 사용 가능)
export const db = getFirestore(app);
