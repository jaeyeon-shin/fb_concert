import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function HomePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // 👈

  const [bgImageUrl, setBgImageUrl] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon(`/api/clearToken?slug=${slug}`);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [slug]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("🔄 페이지 이동 / slug:", slug, "location:", location.key);

      if (!slug) return;

      try {
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });

        const data = await res.json();
        console.log("✅ verify 응답:", data);

        if (!res.ok) {
          alert(`🚫 인증 실패: ${data.message}`);
          setIsAuthorized(false);
          return;
        }

        localStorage.setItem(`ownerToken-${slug}`, data.token);

        const docRef = doc(db, "records", slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBgImageUrl(docSnap.data().bgImageUrl || "");
        } else {
          alert("❌ 등록된 문서가 없습니다.");
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error("🔥 verify 또는 Firestore 오류:", err);
        alert("🔥 오류 발생: " + err.message);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, location.key]); // 👈 뒤로가기 할 때도 다시 verify 함

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
