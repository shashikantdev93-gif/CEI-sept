/**
 * User Details Module Types
 * Phase 2.3 - Modular Architecture
 * 
 * TypeScript interfaces for user details form data, validation, and API responses
 */

// Form Data Interfaces
export interface UserDetailsFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  fatherName: string;
  mobileNo: string;
  faxNo: string;
  email: string;
  altEmail: string;
  address1: string;
  address2: string;
  villageTown: string;
  pinCode: string;
  dob: string;
  state: string;
  district: number | "";
  tehsil: string;
  photo: string;
  signature: string;
  photoPreviewUrl: string;
  signaturePreviewUrl: string;
}

// Form State Management
export interface UserDetailsFormState extends UserDetailsFormData {
  isSubmitting: boolean;
  showOTPModal: boolean;
  generatedOTP: string;
  isMobileNumberVerified: boolean;
}

// Form Validation Errors
export interface UserDetailsFormErrors {
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  mobileNo?: string;
  email?: string;
  dob?: string;
  photo?: string;
  signature?: string;
  address1?: string;
  state?: string;
  district?: string;
  tehsil?: string;
  pinCode?: string;
}

// API Payload Interfaces
export interface UserDetailsPayload {
  firstName: string;
  middleName: string;
  lastName: string;
  fatherName: string;
  mobileNo: string;
  faxNo: string;
  email: string;
  alternateEmail: string;
  dateofbirth: string; // UTC ISO string
  profilePhoto: string;
  signature: string;
  commuAddress1: string;
  commuAddress2: string;
  commuVillageOrTown: string;
  commuState: number;
  commuDistrictRefId: number;
  commuTehsilRefId: number;
  commuPinCode: number;
  applicationCategoryUserType: number;
  isActive: boolean;
  isDelete: boolean;
  createdOnDate: string; // UTC ISO string
  lastModifiedOnDate: string; // UTC ISO string
  userRefId: number;
  clientIPAddress: string;
}

// OTP Related Interfaces
export interface OTPGenerationPayload {
  mobileNumber: string;
  userId: number;
}

export interface OTPResponse {
  success: boolean;
  result?: string;
  message?: string;
}

// API Response Interfaces
export interface UserDetailsApiResponse {
  success: boolean;
  data?: {
    applicationInitiateResponse?: {
      userProfileId: number;
    };
  };
  error?: string;
  message?: string;
}

// File Upload Interface
export interface FileUploadInfo {
  formControlName: string;
  serverResponse: {
    generatedFileNames: string;
  };
}

// Token Interface
export interface UserToken {
  userId: string; // encrypted
  token: string; // encrypted
  userProfileId: string; // encrypted
  projectSiteId: string; // encrypted
  roleCode: string; // encrypted
  userName: string; // encrypted
}

// Business Logic Hook Return Interface
export interface UseUserDetailsBusinessLogicReturn extends UserDetailsFormState {
  // Form State Setters
  setFirstName: (value: string) => void;
  setMiddleName: (value: string) => void;
  setLastName: (value: string) => void;
  setFatherName: (value: string) => void;
  setMobileNo: (value: string) => void;
  setFaxNo: (value: string) => void;
  setEmail: (value: string) => void;
  setAltEmail: (value: string) => void;
  setAddress1: (value: string) => void;
  setAddress2: (value: string) => void;
  setVillageTown: (value: string) => void;
  setPinCode: (value: string) => void;
  setDob: (value: string) => void;
  setState: (value: string) => void;
  setDistrict: (value: number | "") => void;
  setTehsil: (value: string) => void;
  setPhoto: (value: string) => void;
  setSignature: (value: string) => void;
  setPhotoPreviewUrl: (value: string) => void;
  setSignaturePreviewUrl: (value: string) => void;
  setShowOTPModal: (value: boolean) => void;
  setGeneratedOTP: (value: string) => void;
  setIsMobileNumberVerified: (value: boolean) => void;
  
  // Form Validation
  errors: UserDetailsFormErrors;
  setErrors: (errors: UserDetailsFormErrors) => void;
  
  // Business Logic Functions
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleFileUploaded: (info: FileUploadInfo) => void;
  handleDistrictChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handlePincodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOTPVerified: () => Promise<void>;
  
  // Location data from useLocation hook
  districts: any[];
  tehsils: any[];
  loading: boolean;
  locationErrors: any;
  pincodeValidation: { isValid: boolean; error?: string };
}