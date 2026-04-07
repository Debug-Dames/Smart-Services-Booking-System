import { createSlice } from '@reduxjs/toolkit';
import { PaymentState } from './paymentTypes';
import { initiatePayment, fetchPaymentStatus, fetchPaymentHistory } from './paymentThunks';
import { RootState } from '../../app/store';

const initialState: PaymentState = {
  current: null,
  history: [],
  loading: false,
  error:   null,
  status:  'idle',
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError(state) {
      state.error = null;
    },
    resetPaymentStatus(state) {
      state.status  = 'idle';
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    // ── Initiate payment ─────────────────────────────────
    builder
      .addCase(initiatePayment.pending, (state) => {
        state.loading = true;
        state.error   = null;
        state.status  = 'pending';
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        state.status  = action.payload.status;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
        state.status  = 'failed';
      });

    // ── Fetch status ─────────────────────────────────────
    builder
      .addCase(fetchPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        state.status  = action.payload.status;
      })
      .addCase(fetchPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── Fetch history ────────────────────────────────────
    builder
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export const { clearPaymentError, resetPaymentStatus } = paymentSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectCurrentPayment  = (state: RootState) => state.payment.current;
export const selectPaymentHistory  = (state: RootState) => state.payment.history;
export const selectPaymentLoading  = (state: RootState) => state.payment.loading;
export const selectPaymentError    = (state: RootState) => state.payment.error;
export const selectPaymentStatus   = (state: RootState) => state.payment.status;

export default paymentSlice.reducer;