import { useParams, useNavigate } from "react-router-dom"; // URL 파라미터, 페이지 이동
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore"; // Firestore 함수
import { db } from "../firebase";
import Button from "../components/Button"; // 버튼 컴포넌트
import photoIcon from "../assets/icons/photo.png";
import ticketIcon from "../assets/icons/ticket.png";
import musicIcon from "../assets/icons/music.png";
import { generateAndSaveOwnerToken } from "../scripts/generateTokenAndSave"; // 🔐 토큰 발급
import checkAuthWithToken from "../utils/checkAuthWithToken"; // 🔐 인증 함수

export default function HomePage() {
  const { userId } = useParams(); // NFC UUID
  const navigate = useNavigate();

  const [bgImageUrl, setBgImageUrl] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true); // 인증 여부
  const [loading, setLoading] = useState(true); // 로딩 상태

  // 🧹 탭 닫을 때 Firestore 토큰 강제 삭제
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon(`/api/clearToken?nfcId=${userId}`);
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [userId]);

  // 🔐 최초 접속 시 토큰 발급 or 기존 세션 인증
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const isFromTag = params.get("tagged") === "true";

        let newToken = null;

        if (isFromTag) {
          // ✅ NFC 태깅된 경우 → 서버에 nonce 요청 (POST 방식!)
          const res = await fetch('/api/requestTokenNonce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nfcId: userId }),
          });

          const { nonce } = await res.json();

          if (!nonce) {
            alert('🚫 nonce 발급 실패');
            setIsAuthorized(false);
            setLoading(false);
            return;
          }

          // 🔐 nonce가 있으면 토큰 발급 요청
          newToken = await generateAndSaveOwnerToken(userId, nonce);

          if (!newToken) {
            alert("🚫 토큰 발급 실패");
            setIsAuthorized(false);
            setLoading(false);
            return;
          }
        } else {
          // ⏳ 기존 세션 유지
          newToken = localStorage.getItem(`authToken-${userId}`);
        }

        // 🔐 인증 검증
        const isAuth = await checkAuthWithToken(userId, newToken);
        if (!isAuth) {
          alert("🚫 인증 실패: 재접속 차단");
          setIsAuthorized(false);
          return;
        }

        // ✅ 인증 성공 → 내부 이동 허용
        localStorage.setItem(`auth-ok-${userId}`, 'true');

        // 🖼️ 백그라운드 이미지 불러오기
        const docRef = doc(db, "records", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBgImageUrl(docSnap.data().bgImageUrl || "");
        } else {
          alert("❌ 등록된 문서가 없습니다.");
          setIsAuthorized(false);
        }
      } catch (error) {
        alert("🔥 오류 발생: " + error.message);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  // ⏳ 로딩 중
  if (loading) {
    return <div className="p-4 text-white">로딩 중...</div>;
  }

  // ⛔ 인증 실패
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white text-xl text-center px-4">
        ⚠️ 재접속이 허용되지 않거나 등록되지 않은 NFC입니다. <br />
        NFC를 다시 태그해주세요.
      </div>
    );
  }

  // ✅ 인증 성공 시 메인 화면 렌더링
  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center space-y-10"
      style={{ backgroundImage: `url(${bgImageUrl})` }}
    >
      <Button icon={ticketIcon} label="TICKET" onClick={() => navigate(`/ticket/${userId}`)} />
      <Button icon={photoIcon} label="PHOTO" onClick={() => navigate(`/photo/${userId}`)} />
      <Button icon={musicIcon} label="SETLIST" onClick={() => navigate(`/setlist/${userId}`)} />

      {/* 🔧 개발 중 수동 토큰 발급용 버튼 */}
      <button
        onClick={async () => {
          const token = await generateAndSaveOwnerToken(userId);
          if (token) {
            localStorage.setItem(`authToken-${userId}`, token);
            localStorage.setItem(`auth-ok-${userId}`, "true");
            alert(`🔑 수동 토큰 발급 완료: ${token}`);
          }
        }}
        className="mt-4 px-3 py-1 bg-red-600 text-white text-sm rounded"
      >
        🔑 수동 토큰 발급
      </button>
    </div>
  );
}
