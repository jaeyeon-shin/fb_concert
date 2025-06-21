// App.jsx

// 리액트 라우터에서 필요한 컴포넌트들을 import
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 각 페이지 컴포넌트 import
import HomePage from './pages/HomePage';
import TicketPage from './pages/TicketPage';
import PhotoPage from './pages/PhotoPage';
import SetlistPage from './pages/SetlistPage';

// App 컴포넌트는 전체 라우팅을 담당함
export default function App() {
  return (
    <Router>
      <Routes>
        {/* 사용자가 NFC를 태그했을 때 가장 먼저 보여지는 커스텀 홈 화면 */}
        {/* 예: /u/04A2ED12361E90 */}
        <Route path="/u/:userId" element={<HomePage />} />

        {/* 티켓 정보 입력/수정 페이지 */}
        {/* 예: /ticket/04A2ED12361E90 */}
        <Route path="/ticket/:userId" element={<TicketPage />} />

        {/* 사진첩 업로드 페이지 (localStorage 사용) */}
        <Route path="/photo/:userId" element={<PhotoPage />} />

        {/* 공연 셋리스트를 보여주는 페이지 */}
        <Route path="/setlist/:userId" element={<SetlistPage />} />
      </Routes>
    </Router>
  );
}
