import axiosInstance from '../../api/axiosInstance';
import { ENDPOINTS } from '../../api/endpoints';
import { Service } from './serviceTypes';

export const serviceAPI = {
  getAll: () =>
    axiosInstance.get<Service[]>(ENDPOINTS.SERVICES.ALL),

  getById: (id: string) =>
    axiosInstance.get<Service>(ENDPOINTS.SERVICES.BY_ID(id)),

  getByCategory: (category: string) =>
    axiosInstance.get<Service[]>(ENDPOINTS.SERVICES.BY_CATEGORY(category)),
};