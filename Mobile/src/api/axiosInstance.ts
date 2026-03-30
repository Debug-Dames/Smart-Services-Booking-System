import axios from 'axios';
import { loadToken, deleteToken } from '../app/tokenStorage';

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach token to every request ───────────────────
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await loadToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 globally ────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await deleteToken();
      // To redirect to login from here, import your navigation ref and call:
      // navigationRef.current?.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;