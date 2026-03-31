export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  userId: string;
  date: string;       // ISO string e.g. "2026-04-10"
  startTime: string;  // e.g. "10:00"
  endTime: string;    // e.g. "11:00"
  status: BookingStatus;
  notes?: string;
  price: number;
  sessionUrl?: string; // Stripe checkout URL returned on create
}

export interface CreateBookingPayload {
  serviceId: string;
  date: string;
  startTime: string;  // "HH:MM" 24-hour — backend expects this
  endTime: string;    // "HH:MM" 24-hour — derived from startTime + service duration
  notes?: string;
}

export interface BookingState {
  items:      Booking[];
  selected:   Booking | null;
  loading:    boolean;
  error:      string | null;
  successMsg: string | null;
  sessionUrl: string | null; // Stripe checkout URL after create
}