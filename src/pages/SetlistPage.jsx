// 📁 src/pages/SetlistPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function SetlistPage() {
  const { slug } = useParams(); // ex: /setlist/slug_abc123

  const [setlist, setSetlist] = useState([]);         // 🎵 셋리스트 데이터
  const [loading, setLoading] = useState(true);       // 🔄 로딩 여부
  const [authorized, setAuthorized] = useState(true); // 🔐 인증 성공 여부

  useEffect(() => {
    async function fetchData() {
      try {
        // ✅ slug 기반 인증: auth-ok 플래그 + ownerToken 확인
        const isSessionAllowed = localStorage.getItem(`auth-ok-${slug}`) === 'true';
        if (!isSessionAllowed) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        const localToken = localStorage.getItem(`ownerToken-${slug}`);
        if (!localToken) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        // ✅ 인증 통과 시 Firestore에서 setlist 로드
        const docRef = doc(db, 'records', slug);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().setlist) {
          setSetlist(snap.data().setlist);
        }
      } catch (err) {
        console.error("❌ 인증 또는 데이터 로딩 오류:", err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchData();
  }, [slug]);

  // ⛔ 인증 실패 시 메시지
  if (!authorized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white text-xl text-center px-4">
        ⚠️ 재접속이 허용되지 않거나 등록되지 않은 NFC입니다. <br />
        다시 태그해주세요.
      </div>
    );
  }

  // ⏳ 로딩 중일 때
  if (loading) return <div className="p-4 text-white">불러오는 중...</div>;

  // ✅ 인증 성공 시 셋리스트 렌더링
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
