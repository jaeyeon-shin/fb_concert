// src/routes/Router.jsx

// React Router에서 Routes와 Route 컴포넌트 불러오기
import { Routes, Route } from "react-router-dom";

// 각 페이지 컴포넌트 import
import HomePage from "../pages/HomePage";
import TicketPage from "../pages/TicketPage";
import PhotoPage from "../pages/PhotoPage";
import SetlistPage from "../pages/SetlistPage";
import UnauthorizedPage from './pages/UnauthorizedPage';


// Router 컴포넌트: 전체 앱의 라우팅(페이지 전환 경로)을 정의
export default function Router() {
  return (
    <Routes>
      <Route path="/:slug" element={<HomePage />} />
      <Route path="/ticket/:slug" element={<TicketPage />} />
      <Route path="/photo/:slug" element={<PhotoPage />} />
      <Route path="/setlist/:slug" element={<SetlistPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
    </Routes>

  );
}
