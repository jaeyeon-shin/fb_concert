// src/routes/Router.jsx

// React Router에서 Routes와 Route 컴포넌트 불러오기
import { Routes, Route } from "react-router-dom";

// 각 페이지 컴포넌트 import
import HomePage from "../pages/HomePage";
import TicketPage from "../pages/TicketPage";
import PhotoPage from "../pages/PhotoPage";
import SetlistPage from "../pages/SetlistPage";

// Router 컴포넌트: 전체 앱의 라우팅(페이지 전환 경로)을 정의
export default function Router() {
  return (
    <Routes>
      {/* ✅ 메인 진입 페이지 (NFC 태깅 후 진입) */}
      {/* 예: /u/04A2ED12361E90 형태의 URL로 진입 */}
      <Route path="/u/:uuid" element={<HomePage />} />

      {/* 🎫 티켓 페이지: 공연 정보 입력 및 조회 */}
      {/* 예: navigate("/ticket/04A2ED12361E90") */}
      <Route path="/ticket/:userId" element={<TicketPage />} />

      {/* 📸 사진 업로드 및 갤러리 페이지 */}
      <Route path="/photo/:userId" element={<PhotoPage />} />

      {/* 🎵 셋리스트(공연 곡 목록) 페이지 */}
      <Route path="/setlist/:userId" element={<SetlistPage />} />
    </Routes>
  );
}
