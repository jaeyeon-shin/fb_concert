import { useEffect, useState } from 'react';
import useQueryParam from '../utils/useQueryParam';

export default function PhotoPage() {
  const nfcId = useQueryParam('id');
  const [images, setImages] = useState([]);

  // localStorage에서 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(`photoList-${nfcId}`);
    if (saved) {
      setImages(JSON.parse(saved));
    }
  }, [nfcId]);

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        newImages.push(base64);

        // 이미지 하나 읽을 때마다 상태 업데이트
        const updated = [...images, ...newImages];
        setImages(updated);
        localStorage.setItem(`photoList-${nfcId}`, JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">📸 사진첩</h2>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="mb-4"
      />

      {images.length === 0 ? (
        <p className="text-center text-gray-500">아직 업로드한 사진이 없습니다.</p>
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
