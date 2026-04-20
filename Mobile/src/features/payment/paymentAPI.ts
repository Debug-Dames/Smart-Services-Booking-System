import axiosInstance from '../../api/axiosInstance';
import { ENDPOINTS } from '../../api/endpoints';
import { Payment, InitiatePaymentPayload } from './paymentTypes';

export const paymentAPI = {
  initiate: (data: InitiatePaymentPayload) =>
    axiosInstance.post<Payment>(ENDPOINTS.PAYMENTS.ALL, data),

  getStatus: (id: string) =>
    axiosInstance.get<Payment>(ENDPOINTS.PAYMENTS.BY_ID(id)),

  getHistory: () =>
    axiosInstance.get<Payment[]>(ENDPOINTS.PAYMENTS.ALL),
};