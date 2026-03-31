import axiosInstance from '../../api/axiosInstance';
import { ENDPOINTS } from '../../api/endpoints';
import { Booking, CreateBookingPayload } from './bookingTypes';

export const bookingAPI = {
  getMyBookings: () =>
    axiosInstance.get<Booking[]>(ENDPOINTS.BOOKINGS.ALL),

  getById: (id: string) =>
    axiosInstance.get<Booking>(ENDPOINTS.BOOKINGS.BY_ID(id)),

  create: (data: CreateBookingPayload) =>
    axiosInstance.post<Booking>(ENDPOINTS.BOOKINGS.ALL, data),

  cancel: (id: string) =>
    axiosInstance.patch<Booking>(ENDPOINTS.BOOKINGS.CANCEL(id)),
};