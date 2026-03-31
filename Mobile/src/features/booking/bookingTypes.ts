export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  userId: string;
  date: string;       // ISO string e.g. "2026-04-10"
  time: string;       // e.g. "10:30"
  status: BookingStatus;
  notes?: string;
  price: number;
}

export interface CreateBookingPayload {
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
}

export interface BookingState {
  items:      Booking[];
  selected:   Booking | null;
  loading:    boolean;
  error:      string | null;
  successMsg: string | null;
}