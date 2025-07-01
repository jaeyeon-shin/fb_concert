import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Button from "../components/Button";
import photoIcon from "../assets/icons/photo.png";
import ticketIcon from "../assets/icons/ticket.png";
import musicIcon from "../assets/icons/music.png";

export default function HomePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [bgImageUrl, setBgImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // 페이지 닫힐 때 clearToken 호출
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
      console.log("👉 HomePage fetchData(), slug:", slug);

      if (!slug) return;

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
          navigate("/unauthorized");
          return;
        }

        localStorage.setItem(`ownerToken-${slug}`, data.token);
        console.log(`🔐 localStorage 저장 완료: ownerToken-${slug} = ${data.token}`);

        const docRef = doc(db, "records", slug);
        console.log("📚 Firestore 문서 조회 시도:", slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("✅ Firestore 문서 존재:", docSnap.data());
          setBgImageUrl(docSnap.data().bgImageUrl || "");
        } else {
          console.log("❌ Firestore 문서 없음:", slug);
          alert("❌ 등록된 문서가 없습니다.");
          navigate("/unauthorized");
        }
      } catch (err) {
        console.error("🔥 verify 또는 Firestore 오류:", err);
        alert("🔥 오류 발생: " + err.message);
        navigate("/unauthorized");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, navigate]);

  if (loading) return <div className="p-4 text-white">로딩 중...</div>;

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
