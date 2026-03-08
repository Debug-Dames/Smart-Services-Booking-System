import api from './axios';

export const authService = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const bookingService = {
  getBookingsByDate:  (date)         => api.get(`/bookings?date=${date}`),
  getMonthlyBookings: (year, month)  => api.get(`/bookings/monthly?year=${year}&month=${month}`),
  getMyBookings:      ()             => api.get('/bookings/mine'),   // ← /mine, not /bookings
  createBooking:      (data)         => api.post('/bookings', data),
};