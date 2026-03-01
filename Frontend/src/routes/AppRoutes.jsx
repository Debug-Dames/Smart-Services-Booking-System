import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Services from '../pages/Services';
import Contact from '../pages/Contact';
import Dashboard from '../pages/Dashboard';
import BookAppointment from '../pages/BookAppointment';
import MyBookings from '../pages/MyBookings';
import Profile from '../pages/Profile';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          {/* Legacy redirect alias */}
          <Route path="book-appointment" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="book"
            element={
              <ProtectedRoute>
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}