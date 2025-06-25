// 필수 훅 및 모듈 임포트
import { useParams, useNavigate } from "react-router-dom"; // URL 파라미터 읽기 및 페이지 이동
import { useEffect, useState } from "react"; // React 상태 및 생명주기 함수
import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore"; // Firestore 접근 함수
import { db } from "../firebase"; // Firestore 인스턴스
import Button from "../components/Button"; // 공통 버튼 컴포넌트
import photoIcon from "../assets/icons/photo.png"; // 버튼용 아이콘 이미지
import ticketIcon from "../assets/icons/ticket.png";
import musicIcon from "../assets/icons/music.png";
import { generateAndSaveOwnerToken } from "../scripts/generateTokenAndSave"; // 🔐 ownerToken 발급 함수
import checkAuthWithToken from "../utils/checkAuthWithToken"; // 🔐 인증 확인 함수

// 메인 컴포넌트: HomePage
export default function HomePage() {
  const { userId } = useParams(); // URL 경로에서 :userId 값을 추출
  const navigate = useNavigate(); // 페이지 이동 함수

  const [bgImageUrl, setBgImageUrl] = useState(""); // 배경 이미지 URL 상태
  const [isAuthorized, setIsAuthorized] = useState(true); // 접근 허용 여부
  const [loading, setLoading] = useState(true); // 🔄 인증 및 데이터 로딩 여부

  // 🧹 브라우저 탭 닫힐 때 Firestore에서 ownerToken 제거
  useEffect(() => {
    const handleUnload = async () => {
      try {
        const docRef = doc(db, "records", userId);
        await updateDoc(docRef, { ownerToken: deleteField() });
        console.log("🧹 Firestore ownerToken 삭제됨");
      } catch (e) {
        console.warn("❌ ownerToken 삭제 실패:", e.message);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [userId]);

  // 🔐 인증 및 사용자 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ 토큰 발급 시도
        const newToken = await generateAndSaveOwnerToken(userId);
        if (!newToken) {
          alert("⚠️ 토큰 발급 실패");
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        // 2️⃣ 로컬에도 저장 (세션 유지)
        localStorage.setItem(`authToken-${userId}`, newToken);
        alert("📌 새 토큰이 발급되었습니다.");

        // 3️⃣ 인증 확인
        const isAuth = await checkAuthWithToken(userId, newToken);
        if (!isAuth) {
          alert("🚫 인증 실패: 재접속 차단");
          setIsAuthorized(false);
          return;
        }

        // 4️⃣ Firestore에서 데이터 가져오기
        const docRef = doc(db, "records", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBgImageUrl(data.bgImageUrl || "");
        } else {
          alert("❌ Firestore에 등록된 문서가 없습니다.");
          setIsAuthorized(false);
        }
      } catch (error) {
        alert("🔥 오류 발생: " + error.message);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  // ⏳ 로딩 중
  if (loading) {
    return <div className="p-4 text-white">로딩 중...</div>;
  }

  // ⛔ 인증 실패 시
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white text-xl text-center px-4">
        ⚠️ 재접속이 허용되지 않거나 등록되지 않은 NFC입니다. <br />
        NFC를 다시 태그해주세요.
      </div>
    );
  }

  // ✅ 인증 성공 시 메인 콘텐츠 렌더링
  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center space-y-10"
      style={{ backgroundImage: `url(${bgImageUrl})` }}
    >
      <Button icon={ticketIcon} label="TICKET" onClick={() => navigate(`/ticket/${userId}`)} />
      <Button icon={photoIcon} label="PHOTO" onClick={() => navigate(`/photo/${userId}`)} />
      <Button icon={musicIcon} label="SETLIST" onClick={() => navigate(`/setlist/${userId}`)} />

      {/* 🔧 수동 발급 버튼 (운영 시 제거 가능) */}
      <button
        onClick={async () => {
          const token = await generateAndSaveOwnerToken(userId);
          if (token) {
            localStorage.setItem(`authToken-${userId}`, token);
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
