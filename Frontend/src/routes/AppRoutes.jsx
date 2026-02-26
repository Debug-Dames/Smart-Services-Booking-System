import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../Pages/Home';
import Services from '../Pages/Services';
import Dashboard from '../Pages/Dashboard';
import BookAppointment from '../Pages/BookAppointment';
import MyBookings from '../Pages/MyBookings';
import Profile from '../Pages/Profile';
import Login from '../Pages/auth/Login';
import Register from '../Pages/auth/Register';
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
