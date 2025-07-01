import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import checkAuthWithToken from '../utils/checkAuthWithToken';

export default function PhotoPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    async function init() {
      const localToken = localStorage.getItem(`ownerToken-${slug}`);

      const isAuth = await checkAuthWithToken(slug, localToken);
      if (!isAuth) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // 🔥 인증 통과 시 로컬 저장소에서 이미지 로드
      const saved = localStorage.getItem(`photoList-${slug}`);
      if (saved) {
        setImages(JSON.parse(saved));
      }
      setLoading(false);
    }

    if (slug) init();
  }, [slug]);

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        const updated = [...images, base64];
        setImages(updated);
        localStorage.setItem(`photoList-${slug}`, JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    });
  };

  if (!authorized) {
    navigate('/unauthorized');
    return null;
  }

  if (loading) return <div className="p-4 text-white">불러오는 중...</div>;

  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">📸 사진첩</h2>
      <input type="file" accept="image/*" multiple onChange={handleChange} className="mb-4" />
      {images.length === 0 ? (
        <p className="text-center text-gray-400">아직 업로드한 사진이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {images.map((src, i) => (
            <img key={i} src={src} alt={`photo-${i}`} className="rounded object-cover w-full aspect-square" />
          ))}
        </div>
      )}
    </div>
  );
}
