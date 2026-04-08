import axios from "axios";

// ✅ Correct backend URL (NO /api here)
const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://smart-services-booking-system-backend-uzip.onrender.com";

// ✅ Axios instance
const api = axios.create({
  baseURL: API_URL,
});

// ✅ Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ================= AUTH =================
export const authService = {
  register: async (data) => {
    const res = await api.post("/api/auth/register", data);
    return res.data;
  },

  login: async (data) => {
    const res = await api.post("/api/auth/login", data);

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }

    return res.data;
  },

  getMe: async () => {
    const { data } = await api.get("/api/auth/me");
    return data;
  },

  updateProfile: async (payload) => {
    const { data } = await api.put("/api/auth/profile", payload);
    return data;
  },
};

// ================= BOOKINGS =================
export const bookingService = {
  lockSlot: async (payload) => {
    const { data } = await api.post("/api/bookings/lock", payload);
    return data;
  },

  unlockSlot: async (token) => {
    const { data } = await api.delete(`/api/bookings/lock/${token}`);
    return data;
  },

  getBookingsByDate: async (date, serviceId) => {
    const serviceParam = serviceId ? `&serviceId=${serviceId}` : "";
    const { data } = await api.get(
      `/api/bookings?date=${date}${serviceParam}`
    );
    return data;
  },

  getMonthlyBookings: async (year, month, serviceId) => {
    const serviceParam = serviceId ? `&serviceId=${serviceId}` : "";
    const { data } = await api.get(
      `/api/bookings/monthly?year=${year}&month=${month}${serviceParam}`
    );
    return data;
  },

  getMyBookings: async () => {
    const { data } = await api.get("/api/bookings");
    return data;
  },

  createBooking: async (payload) => {
    const { data } = await api.post("/api/bookings", payload);
    return data;
  },

  getAvailableSlots: async (date, serviceId) => {
    const { data } = await api.get("/api/bookings/slots", {
      params: { date, serviceId },
    });
    return data;
  },

  updateBooking: async (id, payload) => {
    const { data } = await api.put(`/api/bookings/${id}`, payload);
    return data;
  },

  cancelBooking: async (id) => {
    const { data } = await api.delete(`/api/bookings/${id}`);
    return data;
  },
};

// ================= SERVICES =================
export const getServices = async () => {
  const res = await api.get("/api/services");
  return res.data;
};

// ================= CONTACT =================
export const contactService = {
  submitMessage: async (data) => {
    const { data: resData } = await api.post("/api/contact", data);
    return resData;
  },
};

export default api;