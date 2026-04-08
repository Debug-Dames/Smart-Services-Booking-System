export const API_URL = "https://smart-services-booking-system-frontend.onrender.com/api/";

export function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}