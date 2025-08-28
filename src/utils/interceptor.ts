import axios, { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { encryptionService } from '../lib';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5143/api';
const IS_DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

// Define our own response interfaces
interface IApiResponse<T> {
  success: boolean;
  data: T;
  status: number;
  message?: string;
  error?: string;
}

interface BackendResponseData {
  message?: string;
  result?: {
    returnCode: number;
    returnMsg: string;
    data: string;
  };
  data?: any;
}

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (IS_DEV_MODE) {
      console.group('🚀 API Request');
      console.log('URL:', config.url);
      console.log('Method:', config.method?.toUpperCase());
      console.log('Original Data:', config.data);
    }

    // Add auth token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${JSON.parse(token)}`;
    }

    // Handle data encryption based on endpoint and config
    if (config.data && !config.headers['skip-encryption']) {
      if (config.url?.includes('/Auth/login')) {
        const encryptedPassword = encryptionService.set(config.data.password);
        const payload = {
          userName: config.data.userName.toLowerCase(),
          password: encryptedPassword
        };
        const encryptedFormData = encryptionService.setForm(JSON.stringify(payload));
        config.data = { body: encryptedFormData };
      }
    }

    if (IS_DEV_MODE) {
      console.log('Processed Data:', config.data);
      console.log('Headers:', config.headers);
      console.groupEnd();
    }

    return config;
  },
  (error: AxiosError) => {
    if (IS_DEV_MODE) {
      console.error('❌ Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<BackendResponseData>) => {
    if (IS_DEV_MODE) {
      console.group('✅ API Response');
      console.log('URL:', response.config.url);
      console.log('Raw Response:', response.data);
    }

    // Transform the response into our IApiResponse format
    let transformedData: IApiResponse<any>;

    // Special handling for captcha endpoint
    if (response.config.url?.includes('/Auth/GetCaptchaImage')) {
      transformedData = {
        success: true,
        data: {
          result: {
            data: response.data.result?.data || '',
            returnCode: response.data.result?.returnCode || 0,
            returnMsg: response.data.result?.returnMsg || ''
          }
        },
        status: response.status
      };
    } else {
      // Handle other endpoints
      transformedData = {
        success: response.data.result?.returnCode === 1,
        data: response.data.result?.data || response.data,
        status: response.status,
        message: response.data.result?.returnMsg || ''
      };
    }

    if (IS_DEV_MODE) {
      console.log('Transformed Response:', transformedData);
      console.groupEnd();
    }

    // Return the axios response with our transformed data
    return {
      ...response,
      data: transformedData
    };
  },
  (error: AxiosError<BackendResponseData>) => {
    if (IS_DEV_MODE) {
      console.group('❌ Response Error');
      console.log('Error:', error.response?.data || error.message);
      console.groupEnd();
    }

    return Promise.reject({
      success: false,
      data: null,
      status: error.response?.status || 500,
      error: error.response?.data?.result?.returnMsg || error.message
    } as IApiResponse<null>);
  }
);

// Helper methods
const http = {
  get: async <T>(url: string, config = {}): Promise<IApiResponse<T>> => {
    const response = await axiosInstance.get(url, config);
    // Access the data property which contains our transformed response from the interceptor
    return response.data;
  },

  post: async <T>(url: string, data = {}, config = {}): Promise<IApiResponse<T>> => {
    const response = await axiosInstance.post(url, data, config);
    return response.data;
  },

  put: async <T>(url: string, data = {}, config = {}): Promise<IApiResponse<T>> => {
    const response = await axiosInstance.put(url, data, config);
    return response.data;
  }
};


export default http;