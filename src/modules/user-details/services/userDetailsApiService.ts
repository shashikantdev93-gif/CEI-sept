/**
 * User Details API Service
 * Phase 2.3 - Modular Architecture
 * 
 * Handles all API interactions for user details form
 */

import CryptoJS from 'crypto-js';
import type { UserDetailsPayload, UserDetailsApiResponse, OTPGenerationPayload, OTPResponse, UserToken } from '../types/UserDetailsTypes';

export class UserDetailsApiService {
  private static secretKey = 'e4da3b7fbbce2345d7772b0674a318d5';
  
  /**
   * Encrypts data using AES encryption
   */
  private static encryptData(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
  }
  
  /**
   * Decrypts data using AES decryption
   */
  private static decryptData(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
  
  /**
   * Gets current user token from session storage
   */
  private static getCurrentUserToken(): UserToken | null {
    const token = sessionStorage.getItem('currentUser');
    if (!token) return null;
    
    try {
      return this.decryptData(token);
    } catch (error) {
      console.error('Error decrypting token:', error);
      return null;
    }
  }
  
  /**
   * Gets client IP address
   */
  private static async getClientIPAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Could not fetch IP address:', error);
      return '127.0.0.1';
    }
  }
  
  /**
   * Submits user details form data to API
   */
  static async submitUserDetails(formData: UserDetailsPayload): Promise<UserDetailsApiResponse> {
    try {
      const token = this.getCurrentUserToken();
      if (!token) {
        throw new Error('User token not found');
      }
      
      const clientIP = await this.getClientIPAddress();
      const payload = {
        ...formData,
        clientIPAddress: clientIP
      };
      
      const encryptedData = this.encryptData(payload);
      
      const response = await fetch('/api/UserProfileDetail/Save_PreUserApplication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: encryptedData })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error submitting user details:', error);
      throw error;
    }
  }
  
  /**
   * Generates OTP for mobile number verification
   */
  static async generateOTP(payload: OTPGenerationPayload): Promise<OTPResponse> {
    try {
      const encryptedData = this.encryptData(payload);
      
      const response = await fetch('/api/UserProfileDetail/Generate_OTP_For_MobileNumber', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: encryptedData })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error generating OTP:', error);
      throw error;
    }
  }
  
  /**
   * Verifies OTP for mobile number
   */
  static async verifyOTP(mobileNumber: string, otp: string): Promise<OTPResponse> {
    try {
      const token = this.getCurrentUserToken();
      if (!token) {
        throw new Error('User token not found');
      }
      
      const payload = {
        mobileNumber,
        otp,
        userId: token.userId
      };
      
      const encryptedData = this.encryptData(payload);
      
      const response = await fetch('/api/UserProfileDetail/Verify_OTP_For_MobileNumber', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: encryptedData })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }
  
  /**
   * Saves user application as draft
   */
  static async saveDraft(formData: UserDetailsPayload): Promise<UserDetailsApiResponse> {
    try {
      const token = this.getCurrentUserToken();
      if (!token) {
        throw new Error('User token not found');
      }
      
      const clientIP = await this.getClientIPAddress();
      const payload = {
        ...formData,
        clientIPAddress: clientIP,
        isActive: false // Mark as draft
      };
      
      const encryptedData = this.encryptData(payload);
      
      const response = await fetch('/api/UserProfileDetail/Save_PreUserApplication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: encryptedData })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }
}

export default UserDetailsApiService;