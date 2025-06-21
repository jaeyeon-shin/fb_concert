// 필수 훅 및 모듈 임포트
import { useParams, useNavigate } from "react-router-dom"; // URL 파라미터 읽기 및 페이지 이동
import { useEffect, useState } from "react"; // React 상태 및 생명주기 함수
import { doc, getDoc } from "firebase/firestore"; // Firestore에서 문서 불러오기
import { db } from "../firebase"; // Firestore 인스턴스
import Button from "../components/Button"; // 공통 버튼 컴포넌트
import photoIcon from "../assets/icons/photo.png"; // 버튼용 아이콘 이미지
import ticketIcon from "../assets/icons/ticket.png";
import musicIcon from "../assets/icons/music.png";

// 메인 컴포넌트: HomePage
export default function HomePage() {
  const { userId } = useParams(); // URL 경로에서 :userId 값을 추출 (ex: /u/1234 → userId = 1234)
  const navigate = useNavigate(); // 페이지 이동 함수

  const [bgImageUrl, setBgImageUrl] = useState(""); // 배경 이미지 URL 상태
  const [isAuthorized, setIsAuthorized] = useState(true); // 접근 허용 여부 (UUID 유효성)

  // Firestore에서 UUID에 해당하는 문서 데이터를 불러옴
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "records", userId); // "records" 컬렉션에서 userId 문서를 참조
        const docSnap = await getDoc(docRef); // 문서 내용 불러오기

        if (docSnap.exists()) {
          const data = docSnap.data(); // 문서가 있으면 데이터 꺼냄
          console.log("✅ Firestore 데이터:", data);
          setBgImageUrl(data.bgImageUrl || ""); // 배경 이미지 URL 세팅
        } else {
          // 문서가 없을 경우 접근 차단 처리
          console.log("❌ 해당 userId로 등록된 문서가 없습니다.");
          setIsAuthorized(false);
        }
      } catch (error) {
        // Firestore 요청 실패 시 처리
        console.error("Firestore 요청 오류:", error);
        setIsAuthorized(false);
      }
    };

    if (userId) {
      fetchData(); // userId가 있을 때만 요청
    }
  }, [userId]);

  // 🔐 접근 차단 시 사용자에게 안내 메시지 출력
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white text-xl">
        ⚠️ 이 NFC 칩은 등록되지 않았습니다.
      </div>
    );
  }

  // ✅ 접근 허용 시 사용자 맞춤 배경 + 3개의 버튼 렌더링
  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center space-y-10"
      // 배경 이미지로 Firestore에서 불러온 URL 적용
      style={{ backgroundImage: `url(${bgImageUrl})` }}
    >
      {/* 3개의 버튼: 각각 페이지 이동 기능 포함 */}
      <Button icon={ticketIcon} label="TICKET" onClick={() => navigate(`/ticket/${userId}`)} />
      <Button icon={photoIcon} label="PHOTO" onClick={() => navigate(`/photo/${userId}`)} />
      <Button icon={musicIcon} label="SETLIST" onClick={() => navigate(`/setlist/${userId}`)} />
    </div>
  );
}
