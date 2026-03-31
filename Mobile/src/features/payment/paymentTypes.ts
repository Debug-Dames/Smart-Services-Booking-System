export type PaymentStatus = 'idle' | 'pending' | 'success' | 'failed';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  createdAt: string;
  receiptUrl?: string;
}

export interface InitiatePaymentPayload {
  bookingId: string;
  amount: number;
  currency: string;
  method: string;
}

export interface PaymentState {
  current:  Payment | null;
  history:  Payment[];
  loading:  boolean;
  error:    string | null;
  status:   PaymentStatus;
}