import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import checkAuthWithToken from '../utils/checkAuthWithToken';

export default function SetlistPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [setlist, setSetlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      console.log("🎵 SetlistPage: slug =", slug);
      const localToken = localStorage.getItem(`ownerToken-${slug}`);
      console.log("🔍 localToken =", localToken);

      const isAuth = await checkAuthWithToken(slug, localToken);
      console.log("✅ checkAuthWithToken result =", isAuth);

      if (!isAuth) {
        console.log("🚫 인증 실패 → /unauthorized 이동");
        navigate('/unauthorized');
        return;
      }

      const docRef = doc(db, 'records', slug);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().setlist) {
        setSetlist(snap.data().setlist);
      }

      setLoading(false);
    }

    if (slug) fetchData();
  }, [slug, navigate]);

  if (loading) return <div className="p-4 text-white">불러오는 중...</div>;

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
