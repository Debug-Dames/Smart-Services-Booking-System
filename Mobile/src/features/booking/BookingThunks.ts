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


// Debugging createBooking — check full response and error objects
export const createBooking = createAsyncThunk(
  'booking/create',
  async (payload: CreateBookingPayload, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.create(payload);
      console.log('FULL RESPONSE:', JSON.stringify(response, null, 2));
      console.log('RESPONSE DATA:', JSON.stringify(response.data, null, 2));
      const { data } = response;
      return { ...data.booking, sessionUrl: data.sessionUrl };
    } catch (err: any) {
      console.log('ERROR:', err);
      console.log('ERROR RESPONSE:', JSON.stringify(err?.response, null, 2));
      console.log('ERROR MESSAGE:', err?.message);
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