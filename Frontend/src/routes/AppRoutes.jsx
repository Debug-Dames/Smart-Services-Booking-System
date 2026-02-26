import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Services from '../pages/Services';
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
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/services" element={<MainLayout><Services /></MainLayout>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
        <Route path="/dashboard" element={<MainLayout><ProtectedRoute><Dashboard /></ProtectedRoute></MainLayout>} />
        <Route path="/book" element={<MainLayout><ProtectedRoute><BookAppointment /></ProtectedRoute></MainLayout>} />
        <Route path="/bookings" element={<MainLayout><ProtectedRoute><MyBookings /></ProtectedRoute></MainLayout>} />
        <Route path="/profile" element={<MainLayout><ProtectedRoute><Profile /></ProtectedRoute></MainLayout>} />
      </Routes>
    </Router>
  );
}
