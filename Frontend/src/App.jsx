import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import BookAppointment from "./pages/BookAppointment";
import Contact from "./pages/Contact";
import Services from "./pages/Services";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* AUTH */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* CORE FEATURES */}
        <Route path="/book-appointment" element={<BookAppointment />} />
       
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />

        {/* FALLBACK */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}