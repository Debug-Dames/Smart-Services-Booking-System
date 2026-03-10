import api from './axios';

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
};

// --- BOOKINGS ---
export const bookingService = {
  getBookingsByDate: async (date) => {
    const { data } = await api.get(`/bookings?date=${date}`);
    return data;
  },
  getMonthlyBookings: async (year, month) => {
    const { data } = await api.get(`/bookings/monthly?year=${year}&month=${month}`);
    return data;
  },
  getMyBookings: async () => {
    const { data } = await api.get('/bookings/mine');
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
  const { data } = await api.get('/services');
  return data;
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