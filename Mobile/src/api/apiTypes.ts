// Generic wrapper for all API responses
export interface ApiResponse<T> {
  message: string;
  data?: T;
}

// Generic paginated response
export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Standard error shape from the backend
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string>;
}