// React 훅과 라우터 기능 import
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function PhotoPage() {
  const { userId } = useParams(); // URL 경로에서 UUID 추출 (ex: /photo/1234 → userId = 1234)
  const [images, setImages] = useState([]); // 업로드된 이미지들을 저장하는 배열 상태

  // 🔄 페이지 로드 시 localStorage에 저장된 이미지들을 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(`photoList-${userId}`); // 각 UUID마다 저장 공간 분리
    if (saved) {
      setImages(JSON.parse(saved)); // 문자열 → 배열로 복원
    }
  }, [userId]);

  // 📤 이미지 업로드 핸들러
  const handleChange = (e) => {
    const files = Array.from(e.target.files); // 업로드한 파일들을 배열로 변환

    // 여러 파일을 순회하며 base64로 인코딩
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result; // base64 인코딩 결과
        const updated = [...images, base64]; // 기존 이미지 배열에 추가
        setImages(updated); // 상태 업데이트
        localStorage.setItem(`photoList-${userId}`, JSON.stringify(updated)); // localStorage에 저장
      };
      reader.readAsDataURL(file); // 파일을 base64로 변환
    });
  };

  // 🖼 렌더링 영역
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

      {/* 사진이 하나도 없는 경우 */}
      {images.length === 0 ? (
        <p className="text-center text-gray-400">아직 업로드한 사진이 없습니다.</p>
      ) : (
        // 업로드된 사진들을 2열 그리드로 표시
        <div className="grid grid-cols-2 gap-2">
          {images.map((src, i) => (
            <img
              key={i}
              src={src} // base64 이미지 데이터
              alt={`photo-${i}`}
              className="rounded object-cover w-full aspect-square"
            />
          ))}
        </div>
      )}
    </div>
  );
}
