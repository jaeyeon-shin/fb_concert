import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Button from "../components/Button";
import photoIcon from "../assets/icons/photo.png";
import ticketIcon from "../assets/icons/ticket.png";
import musicIcon from "../assets/icons/music.png";
import checkAuthWithToken from "../utils/checkAuthWithToken";

export default function HomePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [bgImageUrl, setBgImageUrl] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleClear = () => {
      console.log("💥 HomePage unload/visibilitychange - clearToken");
      navigator.sendBeacon(`/api/clearToken?slug=${slug}`);
    };
    window.addEventListener("beforeunload", handleClear);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handleClear();
    });
    return () => {
      window.removeEventListener("beforeunload", handleClear);
      document.removeEventListener("visibilitychange", handleClear);
    };
  }, [slug]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("🔄 HomePage 이동 / slug:", slug, "location.key:", location.key);

      if (!slug) return;

      const localToken = localStorage.getItem(`ownerToken-${slug}`);
      console.log("🗝 localToken =", localToken);

      if (!localToken) {
        // 최초 태그 → verify 필요
        try {
          const res = await fetch("/api/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          });

          const data = await res.json();
          console.log("✅ /api/verify 응답:", data);

          if (!res.ok) {
            console.log("🚫 인증 실패:", data.message);
            alert(`🚫 인증 실패: ${data.message}`);
            setIsAuthorized(false);
            return;
          }

          localStorage.setItem(`ownerToken-${slug}`, data.token);
          console.log(`🔐 ownerToken-${slug} 저장 완료`);

          // Firestore에서 배경 이미지 불러오기
          const docRef = doc(db, "records", slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setBgImageUrl(docSnap.data().bgImageUrl || "");
          }
        } catch (err) {
          console.error("🔥 HomePage verify 오류:", err);
          alert("🔥 오류 발생: " + err.message);
          setIsAuthorized(false);
        } finally {
          setLoading(false);
        }
      } else {
        // 이미 토큰 있는 상태 → checkAuthWithToken 으로 검증
        const isAuth = await checkAuthWithToken(slug, localToken);
        console.log("✅ checkAuthWithToken =", isAuth);

        if (!isAuth) {
          navigate('/unauthorized');
          return;
        }

        const docRef = doc(db, "records", slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBgImageUrl(docSnap.data().bgImageUrl || "");
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, location.key, navigate]);

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
