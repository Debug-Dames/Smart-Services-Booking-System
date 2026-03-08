import api from './axios';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const bookingService = {
  getAppointments: () => api.get('/appointments'),
  bookAppointment: (data) => api.post('/appointments', data),
};
// Register / Sign Up
export const registerUser = async (data) => {
  const res = await API.post("/auth/register", data);
  return res.data;
};

// Login
export const loginUser = async (data) => {
  const res = await API.post("/auth/login", data);

  // store token
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }

  return res.data;
};