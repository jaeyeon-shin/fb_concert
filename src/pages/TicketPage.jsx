// React 훅, Firebase, 라우터, 인증 유틸 import
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import checkAuthWithToken from '../utils/checkAuthWithToken'; // 🔐 인증 함수 import

export default function TicketPage() {
  const { userId } = useParams(); // 🔍 URL 경로에서 UUID 추출

  const [form, setForm] = useState({
    title: '',
    date: '',
    seat: '',
    note: ''
  });

  const [loading, setLoading] = useState(true);       // 전체 로딩 상태
  const [saved, setSaved] = useState(false);          // 저장 완료 여부
  const [authorized, setAuthorized] = useState(true); // 인증 여부

  // 🔐 인증 및 데이터 불러오기
  useEffect(() => {
    async function fetchData() {
      // ✅ 1. localStorage에서 인증 토큰 꺼내기
      const localToken = localStorage.getItem(`authToken-${userId}`);

      // ⛔ 2. 토큰이 없으면 인증 실패 처리
      if (!localToken) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // 🔐 3. Firestore 토큰과 일치하는지 검사
      const isAuth = await checkAuthWithToken(userId, localToken);

      if (!isAuth) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // ✅ 4. 인증 성공 시 Firestore에서 기존 티켓 데이터 불러오기
      const docRef = doc(db, 'records', userId);
      const snap = await getDoc(docRef);

      if (snap.exists() && snap.data().ticketData) {
        setForm(snap.data().ticketData);
      }

      setLoading(false);
    }

    if (userId) fetchData();
  }, [userId]);

  // ✍️ 입력 핸들러
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  // 💾 저장 핸들러
  const handleSave = async () => {
    const docRef = doc(db, 'records', userId);
    await setDoc(docRef, { ticketData: form }, { merge: true });
    setSaved(true);
  };

  // ⛔ 인증 실패 시 메시지
  if (!authorized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white text-xl text-center px-4">
        ⚠️ 재접속이 허용되지 않거나 등록되지 않은 NFC입니다. <br />
        다시 태그해주세요.
      </div>
    );
  }

  // ⏳ 로딩 중
  if (loading) {
    return <div className="p-4 text-white">불러오는 중...</div>;
  }

  // ✅ 인증 성공 시 티켓 작성 UI
  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4">🎫 티켓 정보 입력</h2>

      {/* 공연명 */}
      <label className="block mb-2">
        공연명
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-1 text-black"
        />
      </label>

      {/* 날짜 */}
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

      {/* 좌석 */}
      <label className="block mb-2">
        좌석
        <input
          name="seat"
          value={form.seat}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-1 text-black"
        />
      </label>

      {/* 메모 */}
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
