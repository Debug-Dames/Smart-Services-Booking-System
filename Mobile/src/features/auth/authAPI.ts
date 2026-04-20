import axiosInstance from '../../api/axiosInstance';
import { ENDPOINTS } from '../../api/endpoints';
import { LoginPayload, RegisterPayload, LoginResponse, RegisterResponse, ProfileResponse } from './authTypes';

export const authAPI = {
  login: (data: LoginPayload) =>
    axiosInstance.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, data),

  register: (data: RegisterPayload) =>
    axiosInstance.post<RegisterResponse>(ENDPOINTS.AUTH.REGISTER, data),

  getProfile: () =>
    axiosInstance.get<ProfileResponse>(ENDPOINTS.AUTH.ME),

  logout: () =>
    axiosInstance.post(ENDPOINTS.AUTH.LOGOUT),
};