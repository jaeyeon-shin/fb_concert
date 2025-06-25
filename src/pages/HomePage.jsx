import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Button from "../components/Button";
import photoIcon from "../assets/icons/photo.png";
import ticketIcon from "../assets/icons/ticket.png";
import musicIcon from "../assets/icons/music.png";
import checkAuthWithToken from "../utils/checkAuthWithToken"; // 🔐 인증 함수

export default function HomePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [bgImageUrl, setBgImageUrl] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [loading, setLoading] = useState(true);

  // 🧹 탭 종료 시 토큰 삭제 요청
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon(`/api/clearToken?nfcId=${userId}`);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const isFromTag = params.get("tagged") === "true";

        let token = null;

        if (isFromTag) {
          // 1️⃣ NFC 태깅 시 → 서버에 nonce 발급 요청 (POST)
          const nonceRes = await fetch("/api/requestTokenNonce", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nfcId: userId }),
          });

          const nonceData = await nonceRes.json();
          const nonce = nonceData?.nonce;

          if (!nonce) {
            alert("🚫 nonce 발급 실패");
            setIsAuthorized(false);
            setLoading(false);
            return;
          }

          // 2️⃣ 서버에 nonce와 함께 토큰 발급 요청
          const tokenRes = await fetch("/api/verifyNonceAndIssueToken", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nfcId: userId, nonce }),
          });

          const tokenData = await tokenRes.json();
          token = tokenData?.token;

          if (!token) {
            alert("🚫 토큰 발급 실패");
            setIsAuthorized(false);
            setLoading(false);
            return;
          }

          // 3️⃣ 로컬에 저장 (하위 페이지 접근용)
          localStorage.setItem(`authToken-${userId}`, token);
        } else {
          // 이전 세션 유지
          token = localStorage.getItem(`authToken-${userId}`);
        }

        // 4️⃣ 인증 유효성 확인
        const isAuth = await checkAuthWithToken(userId, token);
        if (!isAuth) {
          alert("🚫 인증 실패: 재접속 차단");
          setIsAuthorized(false);
          return;
        }

        // 5️⃣ 내부 페이지 접근 허용
        localStorage.setItem(`auth-ok-${userId}`, "true");

        // 6️⃣ Firestore에서 배경 이미지 불러오기
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

  // 로딩 상태
  if (loading) {
    return <div className="p-4 text-white">로딩 중...</div>;
  }

  // 인증 실패 시
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white text-xl text-center px-4">
        ⚠️ 재접속이 허용되지 않거나 등록되지 않은 NFC입니다. <br />
        NFC를 다시 태그해주세요.
      </div>
    );
  }

  // 메인 화면 렌더링
  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center space-y-10"
      style={{ backgroundImage: `url(${bgImageUrl})` }}
    >
      <Button icon={ticketIcon} label="TICKET" onClick={() => navigate(`/ticket/${userId}`)} />
      <Button icon={photoIcon} label="PHOTO" onClick={() => navigate(`/photo/${userId}`)} />
      <Button icon={musicIcon} label="SETLIST" onClick={() => navigate(`/setlist/${userId}`)} />

      {/* 수동 테스트용 토큰 발급 버튼 */}
      <button
        onClick={() => alert("❌ 수동 발급 비활성화됨 (nonce 보호 중)")}
        className="mt-4 px-3 py-1 bg-gray-500 text-white text-sm rounded"
      >
        🔒 수동 토큰 발급 (비활성화)
      </button>
    </div>
  );
}
