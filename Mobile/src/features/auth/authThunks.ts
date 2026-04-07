import { createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from './authAPI';
import { LoginPayload, RegisterPayload } from './authTypes';
import { saveToken, loadToken, deleteToken } from '../../app/tokenStorage';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginPayload, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.login(credentials);
      // data is LoginResponse: { message, token, user }
      await saveToken(data.token);
      return { user: data.user, token: data.token };
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Login failed.';
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.register(payload);
      // No token returned — user navigates to Login to sign in manually
      return { user: data.user };
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Registration failed.';
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await authAPI.logout();
    } catch {
      // still clear locally even if API call fails
    } finally {
      await deleteToken();
    }
  }
);

// Called on app boot — restores session from SecureStore
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await loadToken();
      if (!token) return null;

      try {
        const { data } = await authAPI.getProfile();
        // data is ProfileResponse: { user }
        return { user: data.user, token };
      } catch (profileErr: any) {
        const status = profileErr?.response?.status;
        if (status === 401) {
          await deleteToken();
          return rejectWithValue('Session expired. Please log in again.');
        }
        // Network/server error — keep session alive with existing token
        return { user: null, token };
      }
    } catch (err: any) {
      return rejectWithValue('Failed to restore session.');
    }
  }
);