// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TicketPage from './pages/TicketPage';
import PhotoPage from './pages/PhotoPage';
import SetlistPage from './pages/SetlistPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/u/:userId" element={<HomePage />} />
        <Route path="/ticket/:userId" element={<TicketPage />} />
        <Route path="/photo/:userId" element={<PhotoPage />} />
        <Route path="/setlist/:userId" element={<SetlistPage />} />
      </Routes>
    </Router>
  );
}
