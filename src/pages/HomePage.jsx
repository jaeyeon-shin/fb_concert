import { useNavigate } from 'react-router-dom';
import useQueryParam from '../utils/useQueryParam';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function HomePage() {
  const navigate = useNavigate();
  const nfcId = useQueryParam('id');

  const [bgImage, setBgImage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBackground() {
      try {
        const docRef = doc(db, 'records', nfcId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setBgImage(data.bgImageUrl);
        } else {
          console.warn('해당 NFC ID에 대한 배경 정보가 없습니다.');
          setBgImage('/bg/default.jpg'); // 기본 배경으로 대체 가능
        }
      } catch (err) {
        console.error('Firestore 에러:', err);
        setBgImage('/bg/default.jpg');
      } finally {
        setLoading(false);
      }
    }

    if (nfcId) fetchBackground();
  }, [nfcId]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-black text-white">
        불러오는 중...
      </div>
    );
  }

  return (
    <div
      className="w-screen h-screen bg-cover bg-center flex flex-col justify-center items-center text-white"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <h1 className="text-2xl font-bold mb-6">Welcome!</h1>

      <div className="space-y-4">
        <button
          className="px-6 py-3 bg-white/80 text-black rounded-xl"
          onClick={() => navigate(`/ticket?id=${nfcId}`)}
        >
          🎫 티켓
        </button>
        <button
          className="px-6 py-3 bg-white/80 text-black rounded-xl"
          onClick={() => navigate(`/photo?id=${nfcId}`)}
        >
          🖼️ 포토
        </button>
        <button
          className="px-6 py-3 bg-white/80 text-black rounded-xl"
          onClick={() => navigate(`/setlist?id=${nfcId}`)}
        >
          🎵 셋리스트
        </button>
      </div>
    </div>
  );
}
