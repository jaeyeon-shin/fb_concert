import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import checkAuthWithToken from '../utils/checkAuthWithToken';

export default function TicketPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ title: '', date: '', seat: '', note: '' });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchData() {
      console.log("🎫 TicketPage: slug =", slug, "location.key =", location.key);
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
      if (snap.exists() && snap.data().ticketData) {
        setForm(snap.data().ticketData);
      }

      setLoading(false);
    }

    if (slug) fetchData();

    // 🔥 visibilitychange → 앱 다시 활성화되면 재검증
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        console.log("👀 TicketPage: visibilitychange → 재검증");
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [slug, location.key, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = async () => {
    const docRef = doc(db, 'records', slug);
    await setDoc(docRef, { ticketData: form }, { merge: true });
    setSaved(true);
  };

  if (loading) return <div className="p-4 text-white">불러오는 중...</div>;

  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4">🎫 티켓 정보 입력</h2>
      <label className="block mb-2">
        공연명
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-1 text-black"
        />
      </label>
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
      <label className="block mb-2">
        좌석
        <input
          name="seat"
          value={form.seat}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-1 text-black"
        />
      </label>
      <label className="block mb-4">
        메모
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          className="w-full border p-2 rounded mt-2 text-black"
        />
      </label>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        저장하기
      </button>
      {saved && <p className="text-green-400 mt-2">저장 완료!</p>}
    </div>
  );
}
