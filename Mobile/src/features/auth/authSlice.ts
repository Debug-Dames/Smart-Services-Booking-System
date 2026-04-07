import { createSlice } from '@reduxjs/toolkit';
import { AuthState } from './authTypes';
import { loginUser, registerUser, logoutUser, restoreSession } from './authThunks';
import { RootState } from '../../app/store';

const initialState: AuthState = {
  user:    null,
  token:   null,
  loading: false,
  error:   null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Login ────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload.user;
        state.token   = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── Register ─────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        // No token returned — user will log in manually on LoginScreen
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── Logout ───────────────────────────────────────────
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user    = null;
        state.token   = null;
        state.loading = false;
        state.error   = null;
      });

    // ── Restore session ──────────────────────────────────
    builder
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          // If user is null it means profile fetch failed but token is valid —
          // keep the token so isLoggedIn stays true, user fills in on next API call
          if (action.payload.user) state.user = action.payload.user;
          state.token = action.payload.token;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false;
        state.user    = null;
        state.token   = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectUser        = (state: RootState) => state.auth.user;
export const selectToken       = (state: RootState) => state.auth.token;
export const selectIsLoggedIn  = (state: RootState) => Boolean(state.auth.user) || Boolean(state.auth.token);
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError   = (state: RootState) => state.auth.error;

export default authSlice.reducer;