import axios from "axios";

const API_URL = "http://localhost:5000/api";

// ✅ Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// ✅ Attach token automatically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// --- AUTHENTICATION ---
export const authService = {
  // Register / Sign Up
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  // Login
  login: async (data) => {
    const res = await api.post('/auth/login', data);
    console.log('Login response:', res.data); // Debugging line

    // store token locally
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }

    return res.data;
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  updateProfile: async (payload) => {
    const { data } = await api.put('/auth/profile', payload);
    return data;
  },
};

// --- BOOKINGS ---
export const bookingService = {
  getBookingsByDate: async (date, serviceId) => {
    const serviceParam = serviceId ? `&serviceId=${serviceId}` : "";
    const { data } = await api.get(`/bookings?date=${date}${serviceParam}`);
    return data;
  },
  getMonthlyBookings: async (year, month, serviceId) => {
    const serviceParam = serviceId ? `&serviceId=${serviceId}` : "";
    const { data } = await api.get(`/bookings/monthly?year=${year}&month=${month}${serviceParam}`);
    return data;
  },
  getMyBookings: async () => {
    const { data } = await api.get('/bookings');
    return data;
  },
  createBooking: async (payload) => {
    const { data } = await api.post('/bookings', payload);
    return data;
  },

  bookAppointment: async (payload) => {
    const { data } = await api.post('/bookings', payload);
    return data;
  },

  getAvailableSlots: async (date, serviceId) => {
    const { data } = await api.get('/bookings/slots', {
      params: { date, serviceId },
    });
    return data;
  },

  updateBooking: async (id, payload) => {
    const { data } = await api.put(`/bookings/${id}`, payload);
    return data;
  },

  cancelBooking: async (id) => {
    const { data } = await api.delete(`/bookings/${id}`);
    return data;
  },
};

// --- SERVICES ---
export const getServices = async () => {
  const res = await api.get("/services");
  return res.data;
};

export const getAvailableSlots = async (date, serviceId) => {
  return bookingService.getAvailableSlots(date, serviceId);
};

export const getMyBookings = async () => {
  return bookingService.getMyBookings();
};

export const updateBooking = async (id, payload) => {
  return bookingService.updateBooking(id, payload);
};

export const cancelBooking = async (id) => {
  return bookingService.cancelBooking(id);
};

// --- CONTACT ---
export const contactService = {
  submitMessage: async (data) => {
    const { data: resData } = await api.post('/contact', data);
    return resData;
  },
};
