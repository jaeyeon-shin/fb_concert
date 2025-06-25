// 📁 src/pages/PhotoPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import checkAuthWithToken from '../utils/checkAuthWithToken'; // 🔐 인증 유틸 함수

export default function PhotoPage() {
  const { userId } = useParams(); // ex: /photo/04A2EC12361E90

  const [images, setImages] = useState([]);           // 📸 이미지 상태
  const [loading, setLoading] = useState(true);       // 🔄 로딩 상태
  const [authorized, setAuthorized] = useState(true); // 🔐 인증 성공 여부

  // 🔐 인증 확인 + 사진 데이터 로드
  useEffect(() => {
    async function init() {
      try {
        // 1️⃣ 로컬 저장소에서 토큰 가져오기 (Home에서 저장된 값)
        const localToken = localStorage.getItem(`authToken-${userId}`);
        if (!localToken) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        // 2️⃣ 인증 확인 (checkAuthWithToken은 Firestore에는 접근 X)
        const isAuth = await checkAuthWithToken(userId, localToken);
        if (!isAuth) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        // 3️⃣ 인증 통과 시 로컬 저장소에서 이미지 로드
        const saved = localStorage.getItem(`photoList-${userId}`);
        if (saved) {
          setImages(JSON.parse(saved));
        }
      } catch (err) {
        console.error("❌ 인증 또는 이미지 로드 실패:", err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }

    if (userId) init();
  }, [userId]);

  // 📤 이미지 업로드 핸들러
  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        const updated = [...images, base64];
        setImages(updated);
        localStorage.setItem(`photoList-${userId}`, JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    });
  };

  // ⛔ 인증 실패 시
  if (!authorized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white text-xl text-center px-4">
        ⚠️ 재접속이 허용되지 않거나 등록되지 않은 NFC입니다. <br />
        다시 태그해주세요.
      </div>
    );
  }

  // ⏳ 로딩 중
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

      {/* 이미지 표시 */}
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
