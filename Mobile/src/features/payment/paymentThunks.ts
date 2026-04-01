import { createAsyncThunk } from '@reduxjs/toolkit';
import { paymentAPI } from './paymentAPI';
import { InitiatePaymentPayload } from './paymentTypes';

export const initiatePayment = createAsyncThunk(
  'payment/initiate',
  async (payload: InitiatePaymentPayload, { rejectWithValue }) => {
    try {
      const { data } = await paymentAPI.initiate(payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Payment initiation failed.');
    }
  }
);

export const fetchPaymentStatus = createAsyncThunk(
  'payment/fetchStatus',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await paymentAPI.getStatus(id);
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch payment status.');
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'payment/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await paymentAPI.getHistory();
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to load payment history.');
    }
  }
);