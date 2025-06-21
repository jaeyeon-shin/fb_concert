// React 훅, Firebase 함수, 라우터 훅, 인증 유틸 import
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import checkAuthWithToken from '../utils/checkAuthWithToken';

export default function SetlistPage() {
  const { userId } = useParams(); // URL 경로에서 userId(UUID) 추출

  const [setlist, setSetlist] = useState([]);           // 셋리스트 배열 상태
  const [loading, setLoading] = useState(true);         // 로딩 상태
  const [authorized, setAuthorized] = useState(true);   // 인증 여부

  // 🔐 인증 확인 및 셋리스트 데이터 로드
  useEffect(() => {
    async function fetchData() {
      const isAuth = await checkAuthWithToken(userId); // 인증 확인
      if (!isAuth) {
        setAuthorized(false);
        return;
      }

      const docRef = doc(db, 'records', userId); // Firestore에서 해당 문서 참조
      const snap = await getDoc(docRef);         // 문서 가져오기

      if (snap.exists() && snap.data().setlist) {
        setSetlist(snap.data().setlist);         // setlist 필드가 있으면 상태에 반영
      }

      setLoading(false); // 로딩 완료
    }

    if (userId) fetchData(); // userId가 있을 때 실행
  }, [userId]);

  // ⛔ 인증 실패 시 메시지
  if (!authorized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white text-xl">
        ⚠️ 재접속이 허용되지 않습니다. NFC를 다시 태그해주세요.
      </div>
    );
  }

  // ⏳ 로딩 중일 때
  if (loading) return <div className="p-4 text-white">불러오는 중...</div>;

  // ✅ 인증 성공 후 UI 렌더링
  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">🎵 셋리스트</h2>

      {/* 셋리스트가 없을 때 메시지 */}
      {setlist.length === 0 ? (
        <p className="text-center text-gray-400">등록된 셋리스트가 없습니다.</p>
      ) : (
        // 셋리스트 항목 출력
        <ul className="space-y-2">
          {setlist.map((item, i) => (
            <li key={i}>
              <a
                href={item.url}                     // YouTube 링크 등
                target="_blank"                    // 새 탭에서 열기
                rel="noopener noreferrer"         // 보안 옵션
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
