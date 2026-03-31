import { createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from './bookingAPI';
import { CreateBookingPayload } from './bookingTypes';

export const fetchMyBookings = createAsyncThunk(
  'booking/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await bookingAPI.getMyBookings();
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to load bookings.');
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'booking/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await bookingAPI.getById(id);
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to load booking.');
    }
  }
);

export const createBooking = createAsyncThunk(
  'booking/create',
  async (payload: CreateBookingPayload, { rejectWithValue }) => {
    try {
      const { data } = await bookingAPI.create(payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to create booking.');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await bookingAPI.cancel(id);
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to cancel booking.');
    }
  }
);