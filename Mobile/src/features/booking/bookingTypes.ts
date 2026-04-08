export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface BookingService {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  createdAt: string;
}

export interface Booking {
  id: number;
  date: string;       // ISO string e.g. "2026-04-10T00:00:00.000Z"
  startTime: string;  // ISO string e.g. "2026-04-10T09:00:00.000Z"
  endTime: string;    // ISO string
  status: BookingStatus;
  userId: number;
  serviceId: number;
  createdAt: string;
  service: BookingService;  // nested from backend include: { service: true }
  serviceName?: string;     // optional alias — not in backend response
  price?: number;           // optional — use service.price instead
  sessionUrl?: string;      // Stripe checkout URL, only present after create
}

export interface CreateBookingPayload {
  serviceId: number;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:MM" 24-hour
  endTime: string;    // "HH:MM" 24-hour
  notes?: string;
}

export interface BookingState {
  items:      Booking[];
  selected:   Booking | null;
  loading:    boolean;
  error:      string | null;
  successMsg: string | null;
  sessionUrl: string | null;
}