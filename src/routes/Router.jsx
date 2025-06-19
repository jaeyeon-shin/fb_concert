import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Photo from "../pages/Photo";
import Ticket from "../pages/Ticket";
import Setlist from "../pages/Setlist";

export default function RouterConfig() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home/:userId" element={<Home />} />
        <Route path="/photo/:userId" element={<Photo />} />
        <Route path="/ticket/:userId" element={<Ticket />} />
        <Route path="/setlist/:userId" element={<Setlist />} />
      </Routes>
    </BrowserRouter>
  );
}