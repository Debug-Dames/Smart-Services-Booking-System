import { createAsyncThunk } from '@reduxjs/toolkit';
import { serviceAPI } from './serviceAPI';

export const fetchServices = createAsyncThunk(
  'services/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await serviceAPI.getAll();
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to load services.');
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await serviceAPI.getById(id);
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to load service.');
    }
  }
);

export const fetchServicesByCategory = createAsyncThunk(
  'services/fetchByCategory',
  async (category: string, { rejectWithValue }) => {
    try {
      const { data } = await serviceAPI.getByCategory(category);
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to load services.');
    }
  }
);