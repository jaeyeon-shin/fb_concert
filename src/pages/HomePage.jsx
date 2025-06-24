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
        // ⭐️ 1. ownerToken 존재 여부 확인 → 없으면 자동 발급 후 localStorage에 저장
        let token = localStorage.getItem(`ownerToken-${userId}`);
        if (!token) {
          token = await generateAndSaveOwnerToken(userId); // Firestore에 저장 + token 반환
          localStorage.setItem(`ownerToken-${userId}`, token); // 브라우저에 저장
        }

        // 🔐 2. 인증 토큰 유효성 확인
        const isAuth = await checkAuthWithToken(userId);
        if (!isAuth) {
          console.warn("🚫 인증 실패: 재접속 차단");
          setIsAuthorized(false);
          return;
        }

        // 🔍 3. Firestore에서 데이터 가져오기
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
      } finally {
        setLoading(false); // 인증 및 로딩 완료
      }
    };

    if (userId) {
      fetchData(); // userId가 있을 때만 요청
    }
  }, [userId]);

  // ⏳ 인증/데이터 로딩 중
  if (loading) {
    return <div className="p-4 text-white">로딩 중...</div>;
  }

  // ⛔ 인증 실패 또는 미등록 UUID
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white text-xl text-center px-4">
        ⚠️ 재접속이 허용되지 않거나 등록되지 않은 NFC입니다. <br />
        NFC를 다시 태그해주세요.
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

      {/* 👇 개발 중에만 사용하는 토큰 발급 버튼 (운영 배포 시 삭제 가능) */}
      <button
        onClick={() => generateAndSaveOwnerToken(userId)}
        className="mt-4 px-3 py-1 bg-red-600 text-white text-sm rounded"
      >
        🔑 ownerToken 발급하기
      </button>
    </div>
  );
}
