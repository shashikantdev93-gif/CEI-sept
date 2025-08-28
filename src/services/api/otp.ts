

export interface OTPModalData {
  otp: string;
  mobileNumber: string;
  sentFrom: string;
  generatedOtp: string; 
}


export const getOTPForDisplay = (generatedOTP: string): string => {
  console.log('🔍 [OTP-DISPLAY] Showing generated OTP for reference:', generatedOTP);
  return generatedOTP;
};

