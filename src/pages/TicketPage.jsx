import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import checkAuthWithToken from '../utils/checkAuthWithToken';

export default function TicketPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: '', date: '', seat: '', note: '' });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const localToken = localStorage.getItem(`ownerToken-${slug}`);

      const isAuth = await checkAuthWithToken(slug, localToken);
      if (!isAuth) {
        setAuthorized(false);
        setLoading(false);
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
  }, [slug]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = async () => {
    const docRef = doc(db, 'records', slug);
    await setDoc(docRef, { ticketData: form }, { merge: true });
    setSaved(true);
  };

  if (!authorized) {
    navigate('/unauthorized');
    return null;
  }

  if (loading) return <div className="p-4 text-white">불러오는 중...</div>;

  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4">🎫 티켓 정보 입력</h2>
      <label className="block mb-2">
        공연명
        <input name="title" value={form.title} onChange={handleChange} className="w-full border p-2 rounded mt-1 text-black" />
      </label>
      <label className="block mb-2">
        날짜
        <input name="date" type="date" value={form.date} onChange={handleChange} className="w-full border p-2 rounded mt-1 text-black" />
      </label>
      <label className="block mb-2">
        좌석
        <input name="seat" value={form.seat} onChange={handleChange} className="w-full border p-2 rounded mt-1 text-black" />
      </label>
      <label className="block mb-4">
        메모
        <textarea name="note" value={form.note} onChange={handleChange} className="w-full border p-2 rounded mt-2 text-black" />
      </label>
      <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">
        저장하기
      </button>
      {saved && <p className="text-green-400 mt-2">저장 완료!</p>}
    </div>
  );
}
