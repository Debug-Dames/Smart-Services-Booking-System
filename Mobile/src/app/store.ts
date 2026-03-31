import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

import authReducer    from '../features/auth/authSlice';
import serviceReducer from '../features/services/serviceSlice';
import bookingReducer from '../features/booking/bookingSlice';
import paymentReducer from '../features/payment/paymentSlice';
import chatReducer    from '../features/chat/chatSlice';

const store = configureStore({
  reducer: {
    auth:     authReducer,
    services: serviceReducer,
    booking:  bookingReducer,
    payment:  paymentReducer,
    chat:     chatReducer,
  },
});

// ── Types ──────────────────────────────────────────────────────────────────
export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ── Typed hooks (use these everywhere instead of plain useDispatch/useSelector)
export const useAppDispatch: () => AppDispatch          = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;