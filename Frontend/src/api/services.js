import api from './axios';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Register / Sign Up
export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

// Login
export const loginUser = async (data) => {
  const res = await api.post('/auth/login', data);

  // store token
  if (res.data.token) {
    localStorage.setItem('token', res.data.token);
  }

  return res.data;
};

export const bookingService = {
  getAppointments: () => api.get('/bookings/mine'),
  bookAppointment: (data) => api.post('/bookings', data),
};

export const getServices = async () => {
  const { data } = await api.get('/services');
  return data;
};

export const getAvailableSlots = async (date, serviceId) => {
  const { data } = await api.get('/bookings/slots', {
    params: { date, serviceId },
  });
  return data;
};

export const createBooking = async (payload) => {
  const { data } = await api.post('/bookings', payload);
  return data;
};

export const getMyBookings = async () => {
  const { data } = await api.get('/bookings/mine');
  return data;
};

export const contactService = {
  submitMessage: (data) => api.post('/contact', data),
};
