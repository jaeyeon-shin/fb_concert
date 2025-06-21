// src/pages/PhotoPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function PhotoPage() {
  const { userId } = useParams(); // URL에서 userId 추출
  const [images, setImages] = useState([]);

  // localStorage에서 이미지 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(`photoList-${userId}`);
    if (saved) {
      setImages(JSON.parse(saved));
    }
  }, [userId]);

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

  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">📸 사진첩</h2>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="mb-4"
      />

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
