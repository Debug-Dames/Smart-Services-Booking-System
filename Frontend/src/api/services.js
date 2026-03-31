import api from './axios';

// --- AUTHENTICATION ---
export const authService = {
    // Register / Sign Up
    register: async(data) => {
        const res = await api.post('/auth/register', data);
        return res.data;
    },

    // Login
    login: async(data) => {
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
    getBookingsByDate: (date) =>
  api.get(`/bookings/by-date`, {
    params: { date },
  }),
    getMonthlyBookings: (year, month) => api.get(`/bookings/monthly?year=${year}&month=${month}`),
    getMyBookings: () => api.get('/bookings/mine'), // ← /mine, not /bookings
    createBooking: (data) => api.post('/bookings', data),

    getAppointments: async() => {
        const { data } = await api.get('/bookings/mine');
        return data;
    },

    bookAppointment: async(payload) => {
        const { data } = await api.post('/bookings', payload);
        return data;
    },

    getAvailableSlots: async(date, serviceId) => {
        const { data } = await api.get('/bookings/slots', {
            params: { date, serviceId },
        });
        return data;
    },
};

// --- SERVICES ---
export const getServices = async() => {
    const { data } = await api.get('/services');
    return data;
};

export const getAvailableSlots = async(date, serviceId) => {
    return bookingService.getAvailableSlots(date, serviceId);
};

export const getMyBookings = async() => {
    return bookingService.getAppointments();
};

// --- CONTACT ---
export const contactService = {
    submitMessage: async(data) => {
        const { data: resData } = await api.post('/contact', data);
        return resData;
    },
};