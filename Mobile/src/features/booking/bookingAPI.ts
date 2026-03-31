import axiosInstance from '../../api/axiosInstance';
import { ENDPOINTS } from '../../api/endpoints';
import { Booking, CreateBookingPayload } from './bookingTypes';

// ── Response type for create ──────────────────────────────────
interface CreateBookingResponse {
  booking:    Booking;
  payment:    { id: string; status: string; amount: number };
  sessionUrl: string;
}

export const bookingAPI = {
  getMyBookings: () =>
    axiosInstance.get<Booking[]>(ENDPOINTS.BOOKINGS.ALL),

  getById: (id: string) =>
    axiosInstance.get<Booking>(ENDPOINTS.BOOKINGS.BY_ID(id)),

  create: (data: CreateBookingPayload) =>
    axiosInstance.post<CreateBookingResponse>(ENDPOINTS.BOOKINGS.ALL, data), // ← fix here

  cancel: (id: string) =>
    axiosInstance.patch<Booking>(ENDPOINTS.BOOKINGS.CANCEL(id)),
};