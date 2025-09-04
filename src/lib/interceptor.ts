import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, TokenData } from '../types';
import API_CONFIG from './config';
import encryptionService from './encryptionService';
import { toast } from 'react-toastify';

// Debug information emojis
// 🔄 - Interceptor general
// 🔐 - Authentication
// 📤 - Request
// 📥 - Response
// ⚠️ - Error
// 🌐 - Network

class AxiosInterceptor {
  private instance: AxiosInstance;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  
  constructor() {
    console.log('🔄 [Interceptor]: Creating instance with config:', {
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT
    });
    
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS
      }
    });

    this.setupInterceptors();
  }

  private getAuthHeader(): string | null {
  console.log('🔐 [Auth]: Getting auth header');
  try {
    const tokenStr = localStorage.getItem('token');
    if (!tokenStr) {
      console.log('🔐 [Auth]: No token found in localStorage');
      return null;
    }

    const tokenData = JSON.parse(tokenStr) as TokenData;
    if (!tokenData?.token) {
      console.log('🔐 [Auth]: Invalid token data structure');
      return null;
    }

    // MATCH ANGULAR EXACTLY: Create auth header FIRST using current actionTime
    const authHeader = tokenData.token
      ? `${tokenData.userId},${tokenData.token},${localStorage.getItem('loginTime')},${localStorage.getItem('actionTime')}`
      : '';
    
    console.log('🔐 [Auth]: Auth header created');
    console.log('🔐 [Auth]: Auth header length:', authHeader.length);
    console.log('🔐 [Auth]: Auth header preview:', authHeader.substring(0, 50) + '...');

    // THEN update actionTime for NEXT request (like Angular does)
    const newActionTime = new Date().toString();
    const encryptedActionTime = encryptionService.set(newActionTime);
    localStorage.setItem('actionTime', encryptedActionTime);
    console.log('⏰ [Auth]: ActionTime updated for next request');
    
    // Debug: Verify all parts are encrypted
    const authParts = authHeader.split(',');
    console.log('🔐 [REQUEST-INTERCEPTOR] Auth header parts count:', authParts.length);
    console.log('🔐 [REQUEST-INTERCEPTOR] Auth parts encrypted check:', {
      userId: authParts[0]?.includes('==') || authParts[0]?.includes('+') || authParts[0]?.includes('/'),
      token: authParts[1]?.includes('==') || authParts[1]?.includes('+') || authParts[1]?.includes('/'),
      loginTime: authParts[2]?.includes('==') || authParts[2]?.includes('+') || authParts[2]?.includes('/'),
      actionTime: authParts[3]?.includes('==') || authParts[3]?.includes('+') || authParts[3]?.includes('/')
    });
    
    return authHeader;

  } catch (error) {
    console.error('🔐 [Auth]: Error creating auth header:', error);
    this.handleUnauthorized();
    return null;
  }
}

  private async checkGeolocation(): Promise<boolean> {
    if (!('geolocation' in navigator)) {
      console.error('Geolocation is not supported');
      return false;
    }

    try {
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 20000 });
      });
      return true;
    } catch (error) {
      console.error('Geolocation error:', error);
      return false;
    }
  }

  private setupInterceptors(): void {
    // Request Interceptor
    this.instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      console.log('🔄 [REQUEST-INTERCEPTOR] Starting request processing');
      console.log('🔄 [REQUEST-INTERCEPTOR] URL:', config.url);
      console.log('🔄 [REQUEST-INTERCEPTOR] Method:', config.method);

      if (config.headers) {
          config.headers.set('Accept', 'application/json');
          config.headers.set('Content-Type', 'application/json');
        }
  
      

      // Handle authentication
      const authHeader = this.getAuthHeader();
      if (authHeader) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = authHeader;
        
        console.log('🔐 [REQUEST-INTERCEPTOR] Added auth header');
      }

      

      // Encrypt POST data if needed
      if (config.method?.toLowerCase() === 'post' && 
          config.data && 
          !config.url?.includes('UploadFile')) {
        try {
          console.log('🔒 [REQUEST-INTERCEPTOR] Encrypting POST data');
          const stringifiedData = JSON.stringify(config.data);
          
          if (!stringifiedData) {
            throw new Error('Failed to stringify request data');
          }
          
          const encryptedData = encryptionService.setForm(stringifiedData);
          if (!encryptedData) {
            throw new Error('Failed to encrypt request data');
          }
          
          config.data = { body: encryptedData };
              console.log('🔒 [REQUEST-INTERCEPTOR] Final wrapped body structure created');
              console.log('📦 [REQUEST-INTERCEPTOR] Data encrypted successfully');
            } catch (encryptError) {
              console.error('❌ [REQUEST-INTERCEPTOR] Encryption error:', encryptError);
              throw new Error('Failed to process request data');
            }
          }

      console.log('🚀 [REQUEST-INTERCEPTOR] === FINAL REQUEST DETAILS ===');
          console.log('🚀 [REQUEST-INTERCEPTOR] Final headers:', Object.keys(config.headers || {}));
          console.log('🚀 [REQUEST-INTERCEPTOR] Final body type:', typeof config.data);
          console.log('🚀 [REQUEST-INTERCEPTOR] Sending request to backend...');

          return config;
        } catch (error) {
          console.error('❌ [REQUEST-INTERCEPTOR] Error:', error);
          return Promise.reject(error);
        }
      },
      (error: AxiosError) => {
        console.error('❌ [REQUEST-INTERCEPTOR] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => {
        try {
          // Reset retry count on successful response
          this.retryCount = 0;

          return {
            ...response,
            data: {
              success: true,
              data: response.data,
              status: response.status,
              message: response.data?.message
            }
          };
        } catch (error) {
            console.error('Response interceptor error:', error);
            const errorResponse: AxiosResponse = {
              data: {
                success: false,
                error: 'Internal Server Error',
                status: 500
              },
              status: 500,
              statusText: 'Internal Server Error',
              headers: response.headers,
              config: response.config
            };
            return errorResponse;
          }
      },
      async (error: AxiosError) => {
        try {
          // Check for offline status
          if (!window.navigator.onLine) {
            this.handleOffline();
            return Promise.reject(new Error('Network offline'));
          }

          // Handle retry logic for network errors
          if (error.message === 'Network Error' && this.retryCount < this.maxRetries) {
            this.retryCount++;
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(this.instance(error.config as AxiosRequestConfig));
              }, 1000 * this.retryCount);
            });
          }

          // Handle specific error responses
          if (error.response) {
            const errorMessage = (error.response?.data as any)?.message || 'An error occurred';
            
            switch (error.response.status) {
              case 400:
                toast.error(errorMessage);
                break;
              case 401:
                this.handleUnauthorized();
                break;
              case 403:
                toast.error('Access forbidden');
                break;
              case 404:
                toast.error('Resource not found');
                break;
              case 409:
                toast.error('Conflict - The request could not be completed');
                break;
              case 500:
              case 502:
              case 503:
                toast.error('Server error occurred');
                break;
              default:
                toast.error(`Unexpected Error: ${error.response.status}`);
            }

            return Promise.reject({
              success: false,
              error: errorMessage,
              status: error.response.status
            });
          }

          return Promise.reject({
            success: false,
            error: error.message,
            status: 500
          });
        } catch (interceptorError) {
          console.error('Error in error interceptor:', interceptorError);
          return Promise.reject(error);
        }
      }
    );
  }

  private handleOffline(): void {
    localStorage.clear();
    window.location.href = '/login';
    toast.error('You are offline. Please check your internet connection.');
  }

  private handleUnauthorized(): void {
    localStorage.clear();
    window.location.href = '/login';
    toast.error('Session expired. Please login again.');
  }

  // Public methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    console.log('🔄 [GET]:', url);
    const response = await this.instance.get(url, config);
    console.log('🔄 [GET Response]:', {
      url,
      status: response.status,
      success: response.data?.success
    });
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    console.log('🔄 [POST]:', url, { hasData: !!data });
    const response = await this.instance.post(url, data, config);
    console.log('🔄 [POST Response]:', {
      url,
      status: response.status,
      success: response.data?.success
    });
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    console.log('🔄 [PUT]:', url, { hasData: !!data });
    const response = await this.instance.put(url, data, config);
    console.log('🔄 [PUT Response]:', {
      url,
      status: response.status,
      success: response.data?.success
    });
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    console.log('🔄 [DELETE]:', url);
    const response = await this.instance.delete(url, config);
    console.log('🔄 [DELETE Response]:', {
      url,
      status: response.status,
      success: response.data?.success
    });
    return response.data;
  }

  getInstance(): AxiosInstance {
    return this.instance;
  }
}

export const axiosInterceptor = new AxiosInterceptor();