// 📁 HomePage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Button from "../components/Button";
import photoIcon from "../assets/icons/photo.png";
import ticketIcon from "../assets/icons/ticket.png";
import musicIcon from "../assets/icons/music.png";
import checkAuthWithToken from "../utils/checkAuthWithToken";

export default function HomePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [bgImageUrl, setBgImageUrl] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [loading, setLoading] = useState(true);

  // 🔒 페이지 닫힐 때 ownerToken 제거 요청
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
          // 🔐 nonce 요청
          const res = await fetch("/api/requestTokenNonce", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nfcId: userId }),
          });
          const { nonce } = await res.json();

          if (!nonce) {
            alert("🚫 nonce 발급 실패");
            setIsAuthorized(false);
            return;
          }

          // 🔐 nonce 인증 후 토큰 발급 요청
          const tokenRes = await fetch("/api/verifyNonceAndIssueToken", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nfcId: userId, nonce }),
          });
          const data = await tokenRes.json();
          token = data.token;

          if (!token) {
            alert("🚫 토큰 발급 실패");
            setIsAuthorized(false);
            return;
          }

          localStorage.setItem(`authToken-${userId}`, token);
        } else {
          token = localStorage.getItem(`authToken-${userId}`);
        }

        const isAuth = await checkAuthWithToken(userId, token);
        if (!isAuth) {
          alert("🚫 인증 실패: 재접속 차단");
          setIsAuthorized(false);
          return;
        }

        localStorage.setItem(`auth-ok-${userId}`, "true");

        const docRef = doc(db, "records", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBgImageUrl(docSnap.data().bgImageUrl || "");
        } else {
          alert("❌ 등록된 문서가 없습니다.");
          setIsAuthorized(false);
        }
      } catch (err) {
        alert("🔥 오류 발생: " + err.message);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  if (loading) return <div className="p-4 text-white">로딩 중...</div>;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white text-xl text-center px-4">
        ⚠️ 재접속이 허용되지 않거나 등록되지 않은 NFC입니다. <br />
        NFC를 다시 태그해주세요.
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center space-y-10"
      style={{ backgroundImage: `url(${bgImageUrl})` }}
    >
      <Button icon={ticketIcon} label="TICKET" onClick={() => navigate(`/ticket/${userId}`)} />
      <Button icon={photoIcon} label="PHOTO" onClick={() => navigate(`/photo/${userId}`)} />
      <Button icon={musicIcon} label="SETLIST" onClick={() => navigate(`/setlist/${userId}`)} />
    </div>
  );
}
