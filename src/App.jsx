// App.jsx

// 리액트 라우터에서 필요한 컴포넌트들을 import
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 각 페이지 컴포넌트 import
import HomePage from './pages/HomePage';
import TicketPage from './pages/TicketPage';
import PhotoPage from './pages/PhotoPage';
import SetlistPage from './pages/SetlistPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// App 컴포넌트는 전체 라우팅을 담당함
export default function App() {
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
