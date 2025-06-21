// src/pages/SetlistPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function SetlistPage() {
  const { userId } = useParams(); // URL에서 userId 추출
  const [setlist, setSetlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSetlist() {
      const docRef = doc(db, 'records', userId);
      const snap = await getDoc(docRef);

      if (snap.exists() && snap.data().setlist) {
        setSetlist(snap.data().setlist);
      }
      setLoading(false);
    }

    if (userId) fetchSetlist();
  }, [userId]);

  if (loading) return <div className="p-4">불러오는 중...</div>;

  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">🎵 셋리스트</h2>

      {setlist.length === 0 ? (
        <p className="text-center text-gray-400">등록된 셋리스트가 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {setlist.map((item, i) => (
            <li key={i}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                {i + 1}. {item.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
