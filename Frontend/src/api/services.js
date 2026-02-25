import api from './axios';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const bookingService = {
  getAppointments: () => api.get('/appointments'),
  bookAppointment: (data) => api.post('/appointments', data),
};
