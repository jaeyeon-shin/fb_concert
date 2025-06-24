// 필수 훅 및 모듈 임포트
import { useParams, useNavigate } from "react-router-dom"; // URL 파라미터 읽기 및 페이지 이동
import { useEffect, useState } from "react"; // React 상태 및 생명주기 함수
import { doc, getDoc } from "firebase/firestore"; // Firestore에서 문서 불러오기
import { db } from "../firebase"; // Firestore 인스턴스
import Button from "../components/Button"; // 공통 버튼 컴포넌트
import photoIcon from "../assets/icons/photo.png"; // 버튼용 아이콘 이미지
import ticketIcon from "../assets/icons/ticket.png";
import musicIcon from "../assets/icons/music.png";
import { generateAndSaveOwnerToken } from "../scripts/generateTokenAndSave"; // 🔐 ownerToken 발급 함수
import checkAuthWithToken from "../utils/checkAuthWithToken"; // 🔐 인증 확인 함수

// 메인 컴포넌트: HomePage
export default function HomePage() {
  const { userId } = useParams(); // URL 경로에서 :userId 값을 추출 (ex: /u/1234 → userId = 1234)
  const navigate = useNavigate(); // 페이지 이동 함수

  const [bgImageUrl, setBgImageUrl] = useState(""); // 배경 이미지 URL 상태
  const [isAuthorized, setIsAuthorized] = useState(true); // 접근 허용 여부 (UUID 유효성)
  const [loading, setLoading] = useState(true); // 🔄 인증 및 데이터 로딩 여부

  // 🔐 인증 + Firestore에서 UUID에 해당하는 문서 데이터를 불러옴
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ⭐️ 1. ownerToken 무조건 재발급 (NFC 태그마다 일회성 발급)
        const newToken = await generateAndSaveOwnerToken(userId);
        if (!newToken) {
          alert("⚠️ 토큰 발급 실패");
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        // ✅ 2. 인증용 토큰 로컬에 저장 (다른 페이지에서도 재사용 가능)
        localStorage.setItem(`authToken-${userId}`, newToken);

        alert("📌 새 토큰이 발급되었습니다.");

        // 🔐 3. 즉시 인증 검사 (checkAuthWithToken이 Firestore 토큰을 제거함)
        const isAuth = await checkAuthWithToken(userId, newToken);
        if (!isAuth) {
          alert("🚫 인증 실패: 재접속 차단");
          setIsAuthorized(false);
          return;
        }

        // 🔍 4. Firestore에서 사용자 맞춤 데이터 가져오기
        const docRef = doc(db, "records", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setBgImageUrl(data.bgImageUrl || "");
        } else {
          alert("❌ 등록된 문서가 없습니다.");
          setIsAuthorized(false);
        }
      } catch (error) {
        alert("🔥 오류 발생: " + error.message);
        setIsAuthorized(false);
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    if (userId) {
      fetchData(); // NFC ID가 있을 때만 동작
    }
  }, [userId]);

  // ⏳ 로딩 중
  if (loading) {
    return <div className="p-4 text-white">로딩 중...</div>;
  }

  // ⛔ 인증 실패 시 안내
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
      // 배경 이미지 적용
      style={{ backgroundImage: `url(${bgImageUrl})` }}
    >
      {/* 3개의 버튼: 각각 세부 페이지로 이동 */}
      <Button icon={ticketIcon} label="TICKET" onClick={() => navigate(`/ticket/${userId}`)} />
      <Button icon={photoIcon} label="PHOTO" onClick={() => navigate(`/photo/${userId}`)} />
      <Button icon={musicIcon} label="SETLIST" onClick={() => navigate(`/setlist/${userId}`)} />

      {/* 🔧 테스트용 수동 발급 버튼 */}
      <button
        onClick={async () => {
          const token = await generateAndSaveOwnerToken(userId);
          if (token) {
            localStorage.setItem(`authToken-${userId}`, token); // 수동 발급 시도 시도도 저장
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
