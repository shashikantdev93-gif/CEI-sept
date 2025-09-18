/**
 * Wireman Module Types
 * Phase 2.4 - Modular Architecture
 * 
 * TypeScript interfaces for wireman form data, API responses, and business logic
 */

// Wireman Form Data Interfaces
export interface WiremanFormData {
  name: string;
  fatherName: string;
  panNo: string;
  dateOfBirth: string;
  address: string;
  mobileNumber: string;
  email: string;
  hasCertificateFromOtherState: "Yes" | "No";
}

// Wireman Form State (extends data with additional state)
export interface WiremanFormState extends WiremanFormData {
  isLoading: boolean;
  isDraftMode: boolean;
  draftApplicationId: number | null;
}

// Form Validation Errors
export interface WiremanFormErrors {
  name?: string;
  fatherName?: string;
  panNo?: string;
  dateOfBirth?: string;
  address?: string;
  mobileNumber?: string;
  email?: string;
  hasCertificateFromOtherState?: string;
}

// API Response Interfaces
export interface WiremanLicenceGeneralDetails {
  doYouHoldPermit?: boolean;
  // Add other wireman-specific fields as needed
}

export interface WiremanApplication {
  appId: number;
  applicationType: number;
  wiremanLicence_GeneralDetails?: WiremanLicenceGeneralDetails;
  // Add other application fields as needed
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  mobileNo?: string;
  email?: string;
  commuAddress1?: string;
}

export interface UserProfileMapping {
  userProfile: UserProfile;
}

export interface ProjectSiteUsers {
  userProfileMapping: UserProfileMapping;
}

export interface ProjectSiteData {
  applications?: WiremanApplication[];
  users?: ProjectSiteUsers;
  applicantPanNumber?: string;
}

// Draft Detection Result
export interface DraftDetectionResult {
  draftApplicationId: number | null;
  isDraftMode: boolean;
}

// Navigation State
export interface WiremanNavigationState {
  allowWiremanInformationNavigation: boolean;
  allowUploadWiremanDocumentNavigation: boolean;
  allowDraftNavigation: boolean;
  draftApplicationData?: string;
}

// API Service Responses
export interface WiremanApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// Business Logic Hook Return Type
export interface UseWiremanBusinessLogicReturn extends WiremanFormState {
  // Form State Setters
  setName: (value: string) => void;
  setFatherName: (value: string) => void;
  setPanNo: (value: string) => void;
  setDateOfBirth: (value: string) => void;
  setAddress: (value: string) => void;
  setMobileNumber: (value: string) => void;
  setEmail: (value: string) => void;
  setHasCertificateFromOtherState: (value: "Yes" | "No") => void;
  
  // Form Validation
  errors: WiremanFormErrors;
  setErrors: (errors: WiremanFormErrors) => void;
  
  // Business Logic Functions
  handleBack: () => void;
  handleSaveAndNext: () => void;
  populateFormFromAPI: (wiremanApplication: WiremanApplication) => void;
  getDraftApplicationId: () => number | null;
  
  // Loading States
  setIsLoading: (loading: boolean) => void;
}