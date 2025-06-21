// src/pages/TicketPage.jsx

// React 훅과 Firebase Firestore 관련 함수, 라우터 훅 import
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import checkAuth from '../utils/checkAuth'; // 🔐 인증 유틸 함수 import

export default function TicketPage() {
  const { userId } = useParams(); // URL 경로에서 userId(UUID) 추출

  // 🎫 티켓 정보를 담을 상태 초기값 설정
  const [form, setForm] = useState({
    title: '', // 공연명
    date: '',  // 날짜
    seat: '',  // 좌석
    note: ''   // 메모
  });

  const [loading, setLoading] = useState(true);      // 데이터 로딩 상태
  const [saved, setSaved] = useState(false);         // 저장 완료 여부
  const [authorized, setAuthorized] = useState(true); // 🔐 인증 성공 여부

  // 📥 Firestore에서 기존 티켓 데이터 불러오기 + 🔐 토큰 인증 확인
  useEffect(() => {
    async function fetchData() {
      const isAuth = await checkAuth(userId); // 🔐 checkAuth에서 토큰 확인

      if (!isAuth) {
        setAuthorized(false); // 인증 실패 시 접근 제한
        return;
      }

      const docRef = doc(db, 'records', userId); // Firestore의 'records' 컬렉션에서 해당 UUID 문서 참조
      const snap = await getDoc(docRef);         // 문서 스냅샷 가져오기

      // 데이터가 존재하고 ticketData가 있으면 상태에 반영
      if (snap.exists() && snap.data().ticketData) {
        setForm(snap.data().ticketData);
      }

      setLoading(false); // 로딩 완료
    }

    if (userId) fetchData(); // userId가 있을 경우에만 실행
  }, [userId]);

  // 🔒 인증되지 않은 경우 접근 차단 메시지 출력
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black text-xl">
        ⚠️ 인증되지 않은 접근입니다. 반드시 NFC 태깅을 통해 접속해 주세요.
      </div>
    );
  }

  // ✍️ 입력값 변경 시 상태 업데이트
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value }); // name에 해당하는 키값 업데이트
    setSaved(false); // 수정 시 저장 완료 상태 초기화
  };

  // 💾 저장 버튼 클릭 시 Firestore에 데이터 저장
  const handleSave = async () => {
    const docRef = doc(db, 'records', userId); // UUID 문서 참조

    await setDoc(
      docRef,
      { ticketData: form }, // 티켓 데이터 저장
      { merge: true }       // 기존 데이터 유지하면서 병합 저장
    );

    setSaved(true); // 저장 완료 표시
  };

  // 🔄 로딩 중일 때 표시
  if (loading) return <div className="p-4 text-white">불러오는 중...</div>;

  // 🖥️ 티켓 입력 UI
  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4">🎫 티켓 정보 입력</h2>

      {/* 공연명 입력 */}
      <label className="block mb-2">
        공연명
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-1 text-black"
        />
      </label>

      {/* 날짜 입력 */}
      <label className="block mb-2">
        날짜
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-1 text-black"
        />
      </label>

      {/* 좌석 입력 */}
      <label className="block mb-2">
        좌석
        <input
          name="seat"
          value={form.seat}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-1 text-black"
        />
      </label>

      {/* 메모 입력 */}
      <label className="block mb-4">
        메모
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-1 text-black"
        />
      </label>

      {/* 저장 버튼 */}
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        저장하기
      </button>

      {/* 저장 완료 메시지 */}
      {saved && <p className="text-green-400 mt-2">저장 완료!</p>}
    </div>
  );
}
