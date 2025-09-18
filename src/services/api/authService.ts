import { axiosInterceptor } from '../../lib/interceptor';
import type { ApiResponse } from '../../types';
import encryptionService from '../../lib/encryptionService';
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse, CaptchaData } from '../../types';

// Debug flag - set to false in production
const DEBUG = true;

// Helper function for logging
const log = (area: string, message: string, data?: any) => {
  if (DEBUG) {
    console.log(`🔐 [Auth-${area}]:`, message, data ? data : '');
  }
};


class AuthService {

async signup(signupData: SignupRequest): Promise<ApiResponse<SignupResponse>> {
    log('Signup', 'Starting signup process', { userName: signupData.userName });
    
    try {
      if (signupData.password !== signupData.confirmPassword) {
        log('Signup', 'Password validation failed: passwords do not match');
        return {
          success: false,
          error: 'Passwords do not match'
        };
      }

      log('Signup', 'Encrypting password');
      const encryptedPassword = encryptionService.set(signupData.password);
      
      const payload = {
        userName: signupData.userName.toLowerCase(),
        password: encryptedPassword
      };
      log('Signup', 'Prepared payload for API', { userName: payload.userName });

      log('Signup', 'Making API request to /Auth/Signup');
      const response = await axiosInterceptor.post<SignupResponse>(
        '/Auth/Signup',
        payload
      );
      log('Signup', 'Received API response', { success: response.success });

      return response;
    } catch (error) {
      const result = {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
      return result;
    }
  }

 async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    log('Login', 'Starting login process', { userName: credentials.userName });
    
    try {
      log('Login', 'Encrypting password');
      const encryptedPassword = encryptionService.set(credentials.password);
      
      const payload = {
        userName: credentials.userName.toLowerCase(),
        password: encryptedPassword
      };
      log('Login', 'Prepared payload for API', { userName: payload.userName });

      log('Login', 'Making API request to /Auth/login');
      const response = await axiosInterceptor.post<LoginResponse>(
        '/Auth/login',
        payload
      );
      log('Login', 'Received API response', { success: response.success });

      return response;
    } catch (error) {
      const result = {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
      return result;
    }
  }

  async logout(): Promise<ApiResponse<any>> {
    log('Logout', 'Starting logout process');
    
    try {
      if (typeof window !== 'undefined') {
        log('Logout', 'Clearing local storage items');
        localStorage.removeItem('token');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('actionTime');
        localStorage.clear();
        log('Logout', 'Local storage cleared successfully');
      }

      log('Logout', 'Logout completed successfully');
      return {
        success: true,
        data: null,
        message: 'Logged out successfully'
      };
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  }

  isAuthenticated(): boolean {
    log('Auth', 'Checking authentication status');
    if (typeof window !== 'undefined') {
      const hasToken = !!localStorage.getItem('token');
      log('Auth', `Authentication status: ${hasToken ? 'Authenticated' : 'Not authenticated'}`);
      return hasToken;
    }
    log('Auth', 'Window is undefined, returning false');
    return false;
  }

  getCurrentUser(): any {
    log('Auth', 'Getting current user');
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = JSON.parse(token);
          log('Auth', 'Current user retrieved successfully', { userId: user.userId });
          return user;
        } catch (error) {
          log('Auth', 'Error parsing user token', error);
          return null;
        }
      }
    }
    log('Auth', 'No current user found');
    return null;
  }

  async getCaptchaImage(): Promise<ApiResponse<CaptchaData>> {
    log('Captcha', 'Starting captcha image request');
    try {
      log('Captcha', 'Making API request to /Auth/GetCaptchaImage');
      const response = await axiosInterceptor.get<CaptchaData>('/Auth/GetCaptchaImage');
      log('Captcha', 'Received API response', { success: response.success });

      if (response.success && response.data) {
        log('Captcha', 'Processing captcha response data');
        const result = (response.data as { result?: any }).result;
        
        if (result && result.returnCode === 1) {
          log('Captcha', 'Parsing captcha data');
          const captchaData = JSON.parse(result.data);
          log('Captcha', 'Captcha data parsed successfully');
          
          return {
            success: true,
            data: captchaData,
            message: result.returnMsg
          };
        }
      }
      
      log('Captcha', 'Failed to get valid captcha data');
      return {
        success: false,
        data: undefined,
        message: 'Failed to get captcha'
      };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        message: 'Network error while fetching captcha'
      };
    }
  }
 }

  const authService = new AuthService();


export default authService;
