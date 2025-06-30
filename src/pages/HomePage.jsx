// 📁 HomePage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Button from "../components/Button";
import photoIcon from "../assets/icons/photo.png";
import ticketIcon from "../assets/icons/ticket.png";
import musicIcon from "../assets/icons/music.png";

export default function HomePage() {
  const { slug } = useParams(); // 이제 slug로 URL param 받음
  const navigate = useNavigate();

  const [bgImageUrl, setBgImageUrl] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [loading, setLoading] = useState(true);

  // 🔒 페이지 닫힐 때 ownerToken 제거
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon(`/api/clearToken?slug=${slug}`);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [slug]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔥 API에 slug 보내서 토큰 발급 요청
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        const data = await res.json();

        if (!res.ok) {
          alert(`🚫 인증 실패: ${data.message}`);
          setIsAuthorized(false);
          return;
        }

        // ✅ ownerToken localStorage 저장
        localStorage.setItem(`ownerToken-${slug}`, data.token);

        // 🔥 Firestore에서 bgImageUrl 바로 로딩
        const docRef = doc(db, "records", slug);
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

    if (slug) fetchData();
  }, [slug]);

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
      <Button icon={ticketIcon} label="TICKET" onClick={() => navigate(`/ticket/${slug}`)} />
      <Button icon={photoIcon} label="PHOTO" onClick={() => navigate(`/photo/${slug}`)} />
      <Button icon={musicIcon} label="SETLIST" onClick={() => navigate(`/setlist/${slug}`)} />
    </div>
  );
}
