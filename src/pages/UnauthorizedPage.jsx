import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🚫 UnauthorizedPage 진입 → 인증 실패 상태");
    const timer = setTimeout(() => {
      console.log("⏳ 5초 후 / 로 리다이렉트");
      navigate('/');
    }, 5000);

    return () => {
      clearTimeout(timer);
      console.log("🧹 UnauthorizedPage cleanup: 타이머 해제");
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white text-center px-6">
      <h1 className="text-3xl font-bold mb-4">⚠️ 인증되지 않은 접근입니다</h1>
      <p className="text-lg">NFC 태그를 통해 다시 접속해주세요.</p>
      <p className="text-sm text-gray-400 mt-2">(잠시 후 메인 페이지로 이동합니다)</p>
    </div>
  );
}
