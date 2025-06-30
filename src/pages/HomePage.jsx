// 📁 src/pages/HomePage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Button from "../components/Button";
import photoIcon from "../assets/icons/photo.png";
import ticketIcon from "../assets/icons/ticket.png";
import musicIcon from "../assets/icons/music.png";

console.log("🔥 HomePage 렌더링 시작");

export default function HomePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [bgImageUrl, setBgImageUrl] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("✅ useEffect handleUnload 등록:", slug);
    const handleUnload = () => {
      console.log("💥 페이지 닫힘 - clearToken 호출");
      navigator.sendBeacon(`/api/clearToken?slug=${slug}`);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [slug]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("👉 fetchData() 진입, slug:", slug);

      if (!slug) {
        console.log("❌ slug 없음, 리턴");
        return;
      }

      try {
        console.log("📡 /api/verify 호출");
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        const data = await res.json();
        console.log("✅ /api/verify 응답:", data);

        if (!res.ok) {
          console.log(`🚫 인증 실패: ${data.message}`);
          alert(`🚫 인증 실패: ${data.message}`);
          setIsAuthorized(false);
          return;
        }

        localStorage.setItem(`ownerToken-${slug}`, data.token);
        console.log(`🔐 ownerToken-${slug} 저장 완료`);

        const docRef = doc(db, "records", slug);
        console.log("📚 Firestore 문서 불러오기 시도:", slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("✅ Firestore 문서 존재:", docSnap.data());
          setBgImageUrl(docSnap.data().bgImageUrl || "");
        } else {
          console.log("❌ Firestore 문서 없음:", slug);
          alert("❌ 등록된 문서가 없습니다.");
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error("🔥 fetchData 오류:", err);
        alert("🔥 오류 발생: " + err.message);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  if (loading) {
    console.log("⏳ 로딩 중...");
    return <div className="p-4 text-white">로딩 중...</div>;
  }

  if (!isAuthorized) {
    console.log("⚠️ 인증 실패 UI 표시");
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white text-xl text-center px-4">
        ⚠️ 재접속이 허용되지 않거나 등록되지 않은 NFC입니다. <br />
        NFC를 다시 태그해주세요.
      </div>
    );
  }

  console.log("✅ 인증 완료 UI 렌더링");

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
