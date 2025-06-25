// 📁 src/pages/SetlistPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import checkAuthWithToken from '../utils/checkAuthWithToken'; // 🔐 인증 유틸

export default function SetlistPage() {
  const { userId } = useParams(); // URL 경로에서 UUID 추출 (ex: /setlist/04A2ED12361E90)

  const [setlist, setSetlist] = useState([]);         // 🎵 셋리스트 데이터
  const [loading, setLoading] = useState(true);       // 🔄 로딩 여부
  const [authorized, setAuthorized] = useState(true); // 🔐 인증 성공 여부

  // 🔐 인증 + 셋리스트 로딩
  useEffect(() => {
    async function fetchData() {
      try {
        // 1️⃣ 로컬 토큰 꺼내기 (HomePage에서 저장됨)
        const localToken = localStorage.getItem(`authToken-${userId}`);
        if (!localToken) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        // 2️⃣ 토큰 유효성 확인 (checkAuthWithToken에 토큰 직접 전달)
        const isAuth = await checkAuthWithToken(userId, localToken);
        if (!isAuth) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        // 3️⃣ 인증 통과 시 Firestore에서 setlist 로드
        const docRef = doc(db, 'records', userId);
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

    if (userId) fetchData();
  }, [userId]);

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
