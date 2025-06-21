// src/pages/UnauthorizedPage.jsx
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  // 일정 시간 후 홈으로 리디렉션
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000); // 5초 후 홈으로 이동

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white text-center px-6">
      <h1 className="text-3xl font-bold mb-4">⚠️ 인증되지 않은 접근입니다</h1>
      <p className="text-lg">NFC 태그를 통해 다시 접속해주세요.</p>
      <p className="text-sm text-gray-400 mt-2">(잠시 후 메인 페이지로 이동합니다)</p>
    </div>
  );
}
