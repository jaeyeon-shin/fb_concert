// React 훅, 라우터, 인증 유틸 import
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import checkAuthWithToken from '../utils/checkAuthWithToken';

export default function PhotoPage() {
  const { userId } = useParams(); // URL 경로에서 UUID 추출 (ex: /photo/1234 → userId = 1234)

  const [images, setImages] = useState([]);            // 업로드된 이미지들을 저장하는 상태
  const [loading, setLoading] = useState(true);         // 전체 로딩 상태
  const [authorized, setAuthorized] = useState(true);   // 인증 성공 여부

  // 🔐 인증 확인 및 localStorage 이미지 로드
  useEffect(() => {
    async function init() {
      const isAuth = await checkAuthWithToken(userId); // 인증 로직 실행
      if (!isAuth) {
        setAuthorized(false);
        return;
      }

      const saved = localStorage.getItem(`photoList-${userId}`);
      if (saved) {
        setImages(JSON.parse(saved)); // 문자열을 배열로 변환
      }

      setLoading(false); // 로딩 완료
    }

    if (userId) init(); // userId가 있을 때만 실행
  }, [userId]);

  // 📤 이미지 업로드 핸들러
  const handleChange = (e) => {
    const files = Array.from(e.target.files); // 업로드된 파일들을 배열로 변환

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        const updated = [...images, base64]; // 기존 이미지 + 새 이미지
        setImages(updated); // 상태 업데이트
        localStorage.setItem(`photoList-${userId}`, JSON.stringify(updated)); // localStorage 저장
      };
      reader.readAsDataURL(file); // 파일을 base64로 변환
    });
  };

  // ⛔ 인증 실패 시 메시지
  if (!authorized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white text-xl">
        ⚠️ 재접속이 허용되지 않습니다. NFC를 다시 태그해주세요.
      </div>
    );
  }

  // ⏳ 로딩 중일 때
  if (loading) {
    return <div className="p-4 text-white">불러오는 중...</div>;
  }

  // ✅ UI 렌더링
  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">📸 사진첩</h2>

      {/* 파일 업로드 input */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="mb-4"
      />

      {/* 업로드된 이미지 표시 */}
      {images.length === 0 ? (
        <p className="text-center text-gray-400">아직 업로드한 사진이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`photo-${i}`}
              className="rounded object-cover w-full aspect-square"
            />
          ))}
        </div>
      )}
    </div>
  );
}
