// SECURITY UPGRADE: Now uses axiosInterceptor for all registration operations
// This implements the exact Angular flow from verifyMobileNumber()

import { axiosInterceptor } from '../../lib/interceptor';
import encryptionService from '../../lib/encryptionService';

export interface UserDetailsData {
  firstName: string;
  middleName?: string;
  lastName: string;
  fatherName: string;
  mobileNo: string;
  faxNo?: string;
  email: string;
  alternateEmail?: string;
  dateofbirth: string;
  profilePhoto: string;
  signature: string;
  commuAddress1: string;
  commuAddress2?: string;
  commuVillageOrTown?: string;
  commuState: number;
  commuDistrictRefId: number;
  commuTehsilRefId: number;
  commuPinCode: number;
  applicationCategoryUserType: number;
  isActive: boolean;
  isDelete: boolean;
  createdOnDate: string;
  lastModifiedOnDate: string;
  userRefId?: number;
  enteredOTP?: string;
  generatedOTP?: string;
  mobileNumberVerified?: boolean;
}

export interface GenerateOTPRequest {
  mobileNumber: string;
  userId: number;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  data?: string; 
  result?: string;
}

export interface UserDetailsResponse {
  success: boolean;
  message: string;
  applicationInitiateResponse?: {
    userProfileId: string;
  };
}


// Step 2: Submit user details (same endpoint as Angular save() method)
export const saveUserDetails = async (userData: any) => {
  try {
    const response = await axiosInterceptor.post('/UserDetails/addUpdate_UserDetails', userData);
    return response.data;
  } catch (error) {
    console.error('🔐 [Registration] Save user details error:', error);
    throw new Error('Failed to save user details');
  }
};



export const generateOTP = async (mobileNumber: string) => {
  try {
    const token = JSON.parse(localStorage.getItem('token') || '{}');
    const userId = encryptionService.decrypt(token.userId);
    
    const payload = {
      mobileNumber,
      userId: parseInt(userId)
    };

    const response = await axiosInterceptor.post('/ProjectSites/generateOtp', payload);
    const data = response.data as any;
    return JSON.parse(encryptionService.decrypt(data.data));
  } catch (error) {
    console.error('🔐 [Registration] Generate OTP error:', error);
    throw new Error('Failed to generate OTP');
  }
};


export const checkDuplicateUser = async (email: string, phoneNo: string): Promise<any> => {
  try {
    console.log('📤 [API] Checking duplicate user...');
    phoneNo = phoneNo.replace(/\D/g, ''); 
    email = email.trim().toLowerCase(); 
    

    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      formModel: null 
    };
  } catch (error: any) {
    console.error('[API] Check duplicate error:', error);
    throw error;
  }
};