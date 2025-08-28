
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormField {
  value: string;
  error?: string;
  touched?: boolean;
  valid?: boolean;
}

export interface LoadingState {
  [key: string]: boolean;
}

export interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface TokenData {
  userId: string;
  token: string;
  accessToken?: string;
  loginTime?: string;
  actionTime?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  status: number;
  message?: string;
}

export interface ApiConfig {
  BASE_URL: string;
  DEFAULT_HEADERS: Record<string, string>;
  TIMEOUT: number;
}

export interface OTPResponse {
  result: string;
  message?: string;
  success: boolean;
}
