import { createSlice } from '@reduxjs/toolkit';
import { BookingState } from './bookingTypes';
import { fetchMyBookings, fetchBookingById, createBooking, cancelBooking } from './BookingThunks';
import { RootState } from '../../app/store';

const initialState: BookingState = {
  items:      [],
  selected:   null,
  loading:    false,
  error:      null,
  successMsg: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingError(state) {
      state.error = null;
    },
    clearBookingSuccess(state) {
      state.successMsg = null;
    },
    clearSelectedBooking(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch my bookings ────────────────────────────────
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── Fetch by id ──────────────────────────────────────
    builder
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading  = false;
        state.selected = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── Create ───────────────────────────────────────────
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading    = true;
        state.error      = null;
        state.successMsg = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading    = false;
        state.successMsg = 'Booking confirmed!';
        state.items.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── Cancel ───────────────────────────────────────────
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg = 'Booking cancelled.';
        const idx = state.items.findIndex(b => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export const { clearBookingError, clearBookingSuccess, clearSelectedBooking } = bookingSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectBookings        = (state: RootState) => state.booking.items;
export const selectSelectedBooking = (state: RootState) => state.booking.selected;
export const selectBookingLoading  = (state: RootState) => state.booking.loading;
export const selectBookingError    = (state: RootState) => state.booking.error;
export const selectBookingSuccess  = (state: RootState) => state.booking.successMsg;

export default bookingSlice.reducer;