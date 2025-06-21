// React 훅과 Firebase 관련 함수, 인증 유틸 가져오기
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import checkAuth from '../utils/checkAuth'; // ✅ 인증 함수 추가

export default function SetlistPage() {
  const { userId } = useParams(); // URL 경로에서 UUID 추출
  const [setlist, setSetlist] = useState([]); // 셋리스트를 담을 상태
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태
  const [authorized, setAuthorized] = useState(true); // 인증 상태

  // 🔄 페이지 진입 시 셋리스트 불러오기 + 인증 체크
  useEffect(() => {
    async function fetchSetlist() {
      const isAuth = await checkAuth(userId); // ✅ 접속 유효성 검사
      if (!isAuth) {
        setAuthorized(false); // 인증 실패 시 차단
        return;
      }

      const docRef = doc(db, 'records', userId); // Firestore의 해당 UUID 문서 참조
      const snap = await getDoc(docRef); // 문서 데이터 가져오기

      // 셋리스트가 존재하면 상태 업데이트
      if (snap.exists() && snap.data().setlist) {
        setSetlist(snap.data().setlist); // [{ title, url }, ...]
      }

      setLoading(false); // 로딩 종료
    }

    if (userId) fetchSetlist(); // userId가 있을 경우만 실행
  }, [userId]);

  // 🔒 인증 실패 시 경고 메시지 표시
  if (!authorized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white text-xl">
        ⚠️ 접속이 만료되었습니다. 다시 NFC 태그로 접속해주세요.
      </div>
    );
  }

  // 🔄 로딩 중인 경우 표시
  if (loading) return <div className="p-4 text-white">불러오는 중...</div>;

  // 🖥 렌더링 화면
  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">🎵 셋리스트</h2>

      {/* 셋리스트가 없는 경우 */}
      {setlist.length === 0 ? (
        <p className="text-center text-gray-400">등록된 셋리스트가 없습니다.</p>
      ) : (
        // 셋리스트 항목들을 링크 형태로 표시
        <ul className="space-y-2">
          {setlist.map((item, i) => (
            <li key={i}>
              <a
                href={item.url} // YouTube 등 외부 링크
                target="_blank" // 새 창에서 열기
                rel="noopener noreferrer" // 보안 옵션
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
