// src/routes/Router.jsx
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import TicketPage from "../pages/TicketPage";
import PhotoPage from "../pages/PhotoPage";
import SetlistPage from "../pages/SetlistPage";

export default function Router() {
  return (
    <Routes>
      <Route path="/u/:uuid" element={<HomePage />} />
      <Route path="/ticket" element={<TicketPage />} />
      <Route path="/photo" element={<PhotoPage />} />
      <Route path="/setlist" element={<SetlistPage />} />
    </Routes>
  );
}
