import { createSlice } from '@reduxjs/toolkit';
import { ServicesState } from './serviceTypes';
import { fetchServices, fetchServiceById, fetchServicesByCategory } from './serviceThunks';
import { RootState } from '../../app/store';

const initialState: ServicesState = {
  items:    [],
  selected: null,
  loading:  false,
  error:    null,
};

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearSelectedService(state) {
      state.selected = null;
    },
    clearServiceError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch all ────────────────────────────────────────
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── Fetch by id ──────────────────────────────────────
    builder
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading  = false;
        state.selected = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── Fetch by category ────────────────────────────────
    builder
      .addCase(fetchServicesByCategory.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchServicesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = action.payload;
      })
      .addCase(fetchServicesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export const { clearSelectedService, clearServiceError } = serviceSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectServices        = (state: RootState) => state.services.items;
export const selectSelectedService = (state: RootState) => state.services.selected;
export const selectServicesLoading = (state: RootState) => state.services.loading;
export const selectServicesError   = (state: RootState) => state.services.error;

export default serviceSlice.reducer;