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
    const serviceParam = serviceId ? `&serviceId=${serviceId}` : '';
    const { data } = await api.get(`/bookings?date=${date}${serviceParam}`);
    return data;
  },
  getMonthlyBookings: async (year, month, serviceId) => {
    const serviceParam = serviceId ? `&serviceId=${serviceId}` : '';
    const { data } = await api.get(`/bookings/monthly?year=${year}&month=${month}${serviceParam}`);
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
  return [
    {
      id: 2,
      name: "Haircut",
      price: 150,
      duration: 60
    },
    {
      id: 3,
      name: "Hair Styling",
      price: 200,
      duration: 60
    },
    {
      id: 4,
      name: "Hair Coloring",
      price: 350,
      duration: 90
    },
    {
      id: 5,
      name: "Nails",
      price: 220,
      duration: 60
    },
    {
      id: 6,
      name: "Braids",
      price: 350,
      duration: 120
    }
  ];
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
