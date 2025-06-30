import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TicketPage from './pages/TicketPage';
import PhotoPage from './pages/PhotoPage';
import SetlistPage from './pages/SetlistPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:slug" element={<HomePage />} />
        <Route path="/ticket/:slug" element={<TicketPage />} />
        <Route path="/photo/:slug" element={<PhotoPage />} />
        <Route path="/setlist/:slug" element={<SetlistPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </Router>
  );
}
