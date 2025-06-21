// React 훅과 Firebase 관련 함수 import
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function SetlistPage() {
  const { userId } = useParams(); // URL 경로에서 userId(UUID)를 추출
  const [setlist, setSetlist] = useState([]); // 셋리스트 배열 상태
  const [loading, setLoading] = useState(true); // 로딩 상태

  // 🔄 Firestore에서 셋리스트 데이터 불러오기
  useEffect(() => {
    async function fetchSetlist() {
      const docRef = doc(db, 'records', userId); // 'records' 컬렉션에서 UUID 문서를 찾음
      const snap = await getDoc(docRef); // 문서 스냅샷 가져오기

      // 문서가 존재하고 setlist 필드가 있으면 상태 업데이트
      if (snap.exists() && snap.data().setlist) {
        setSetlist(snap.data().setlist); // [{ title, url }, ...]
      }

      setLoading(false); // 로딩 완료
    }

    if (userId) fetchSetlist(); // userId가 있을 때만 실행
  }, [userId]);

  // 🔄 로딩 중일 때 보여주는 화면
  if (loading) return <div className="p-4">불러오는 중...</div>;

  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">🎵 셋리스트</h2>

      {/* 셋리스트가 없을 때 메시지 표시 */}
      {setlist.length === 0 ? (
        <p className="text-center text-gray-400">등록된 셋리스트가 없습니다.</p>
      ) : (
        // 셋리스트 항목들 렌더링 (링크 형태로 표시)
        <ul className="space-y-2">
          {setlist.map((item, i) => (
            <li key={i}>
              <a
                href={item.url} // YouTube 링크 등
                target="_blank" // 새 창에서 열기
                rel="noopener noreferrer" // 보안상 안전하게 열기
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
