// 필수 훅 및 모듈 임포트
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../firebase";
import Button from "../components/Button";
import photoIcon from "../assets/icons/photo.png";
import ticketIcon from "../assets/icons/ticket.png";
import musicIcon from "../assets/icons/music.png";
import { generateAndSaveOwnerToken } from "../scripts/generateTokenAndSave";
import checkAuthWithToken from "../utils/checkAuthWithToken";

export default function HomePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [bgImageUrl, setBgImageUrl] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [loading, setLoading] = useState(true);

  // ✅ 탭 닫을 때 Firestore의 ownerToken 제거
  useEffect(() => {
    const handleUnload = async () => {
      try {
        const docRef = doc(db, "records", userId);
        await updateDoc(docRef, { ownerToken: deleteField() });
        console.log("🧹 Firestore ownerToken 삭제됨");
        sessionStorage.removeItem(`session-${userId}`);
        localStorage.removeItem(`authToken-${userId}`);
      } catch (e) {
        console.warn("❌ ownerToken 삭제 실패:", e.message);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [userId]);

  // ✅ 세션 존재 여부에 따라 로직 분기
  useEffect(() => {
    const run = async () => {
      try {
        const sessionKey = `session-${userId}`;

        // 📌 세션이 없을 경우에만 토큰 발급
        if (!sessionStorage.getItem(sessionKey)) {
          const newToken = await generateAndSaveOwnerToken(userId);
          if (!newToken) {
            alert("⚠️ 토큰 발급 실패");
            setIsAuthorized(false);
            setLoading(false);
            return;
          }
          localStorage.setItem(`authToken-${userId}`, newToken);
          sessionStorage.setItem(sessionKey, "active");
          alert("📌 새 토큰이 발급되었습니다.");
        }

        // ✅ 인증 검사
        const isAuth = await checkAuthWithToken(userId);
        if (!isAuth) {
          alert("🚫 인증 실패: 재접속 차단");
          setIsAuthorized(false);
          return;
        }

        // ✅ Firestore에서 데이터 불러오기
        const docRef = doc(db, "records", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBgImageUrl(data.bgImageUrl || "");
        } else {
          alert("❌ 등록된 문서가 없습니다.");
          setIsAuthorized(false);
        }
      } catch (e) {
        alert("🔥 오류 발생: " + e.message);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    if (userId) run();
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

      <button
        onClick={async () => {
          const token = await generateAndSaveOwnerToken(userId);
          if (token) {
            localStorage.setItem(`authToken-${userId}`, token);
            sessionStorage.setItem(`session-${userId}`, "active");
            alert(`🔑 수동 토큰 발급 완료: ${token}`);
          } else {
            alert("❌ 토큰 수동 발급 실패");
          }
        }}
        className="mt-4 px-3 py-1 bg-red-600 text-white text-sm rounded"
      >
        🔑 ownerToken 수동 발급
      </button>
    </div>
  );
}
