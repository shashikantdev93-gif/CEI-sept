/**
 * Project Site Types
 * Phase 2.5 - Modular Architecture
 * 
 * TypeScript interfaces for project site form management
 */

// ===== FORM DATA INTERFACES =====
export interface ProjectSiteFormData {
  projectSiteApplicationType: string;
  applicantPanNumber: string;
  applicantPanAttachment: string;
  address1: string;
  address2: string;
  villageOrTown: string;
  pinCode: string;
  state: string;
  district: number | "";
  tehsil: string;
  panPreviewUrl: string;
  isSubmitting: boolean;
}

// ===== VALIDATION INTERFACES =====
export interface ProjectSiteFormErrors {
  projectSiteApplicationType?: string;
  applicantPanNumber?: string;
  applicantPanAttachment?: string;
  address1?: string;
  address2?: string;
  villageOrTown?: string;
  pinCode?: string;
  state?: string;
  district?: string;
  tehsil?: string;
}

// ===== FILE UPLOAD INTERFACE =====
export interface FileUploadInfo {
  formControlName: string;
  serverResponse: {
    generatedFileNames: string;
    [key: string]: any;
  };
}

// ===== API INTERFACES =====
export interface ProjectSiteApiFormData {
  ProjectSiteApplicationType: number;
  ApplicantPanNumber: string;
  ApplicantPanAttachment: string;
  Address1: string;
  Address2: string;
  VillageOrTown: string;
  PinCode: number;
  State: number;
  DistrictRefId: number;
  TehsilRefId: number;
  IsActive: boolean;
  IsDelete: boolean;
  CreatedOnDate: string;
  LastModifiedOnDate: string;
  UserRefId: number;
  ProjectSiteId: number;
  ClientIPAddress: string;
}

export interface ProjectSiteApiResponse {
  success: boolean;
  data?: {
    applicationInitiateResponse?: {
      projectSiteId: number;
    };
    projectSiteId?: number;
    data?: {
      projectSiteId: number;
    };
    formModel?: {
      projectSiteId: number;
    };
  };
  error?: string;
  message?: string;
}

export interface PanValidationResponse {
  success: boolean;
  data?: {
    formModel: any;
  };
  error?: string;
}

// ===== LOCATION INTERFACES =====
export interface District {
  id: number;
  name: string;
  stateId: number;
}

export interface Tehsil {
  id: number;
  name: string;
  districtId: number;
}

export interface LocationState {
  districts: District[];
  tehsils: Tehsil[];
  loading: boolean;
  errors: Record<string, string>;
  pincodeValidation: {
    isValid: boolean;
    error?: string;
  };
}

// ===== BUSINESS LOGIC HOOK RETURN TYPE =====
export interface UseProjectSiteBusinessLogicReturn {
  // Form State
  projectSiteApplicationType: string;
  applicantPanNumber: string;
  applicantPanAttachment: string;
  address1: string;
  address2: string;
  villageOrTown: string;
  pinCode: string;
  state: string;
  district: number | "";
  tehsil: string;
  isSubmitting: boolean;
  panPreviewUrl: string;
  
  // Form State Setters
  setProjectSiteApplicationType: (value: string) => void;
  setApplicantPanNumber: (value: string) => void;
  setApplicantPanAttachment: (value: string) => void;
  setAddress1: (value: string) => void;
  setAddress2: (value: string) => void;
  setVillageOrTown: (value: string) => void;
  setPinCode: (value: string) => void;
  setState: (value: string) => void;
  setDistrict: (value: number | "") => void;
  setTehsil: (value: string) => void;
  setPanPreviewUrl: (value: string) => void;
  
  // Form Validation
  errors: ProjectSiteFormErrors;
  setErrors: (errors: ProjectSiteFormErrors) => void;
  
  // Location Management
  districts: District[];
  tehsils: Tehsil[];
  locationLoading: boolean;
  locationErrors: Record<string, string>;
  pincodeValidation: {
    isValid: boolean;
    error?: string;
  };
  
  // Business Logic Functions
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleFileUploaded: (info: FileUploadInfo) => void;
  handleDistrictChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handlePincodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePanChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  // Loading States
  setIsSubmitting: (loading: boolean) => void;
  
  // Utility Functions
  getCurrentFormData: () => ProjectSiteFormData;
  resetForm: () => void;
  validateForm: () => boolean;
}

// ===== SERVICE INTERFACES =====
export interface ProjectSiteServiceConfig {
  baseURL?: string;
  timeout?: number;
}

export interface ProjectSiteService {
  validatePan: (panNumber: string) => Promise<PanValidationResponse>;
  submitProjectSite: (formData: ProjectSiteApiFormData) => Promise<ProjectSiteApiResponse>;
  getClientIP: () => string;
  prepareFormData: (
    formData: ProjectSiteFormData,
    userRefId: number,
    projectSiteId: number,
    clientIP: string
  ) => ProjectSiteApiFormData;
}

// ===== TOKEN INTERFACES =====
export interface TokenData {
  userId: string;
  projectSiteId?: string;
  [key: string]: any;
}

export interface ClientData {
  ip: string;
  [key: string]: any;
}

// ===== VALIDATION CONSTANTS =====
export const PROJECT_SITE_VALIDATION = {
  PAN_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  PINCODE_LENGTH: 6,
  REQUIRED_FIELDS: [
    'projectSiteApplicationType',
    'applicantPanNumber',
    'applicantPanAttachment',
    'address1',
    'state',
    'district',
    'tehsil',
    'pinCode'
  ] as const
} as const;

// ===== APPLICATION TYPE CONSTANTS =====
export const APPLICATION_TYPES = {
  CONTRACTOR_SUPERVISOR_OTHER: '2',
  WIREMAN_LICENSE: '1'
} as const;

// ===== DEFAULT VALUES =====
export const DEFAULT_PROJECT_SITE_FORM: ProjectSiteFormData = {
  projectSiteApplicationType: '',
  applicantPanNumber: '',
  applicantPanAttachment: '',
  address1: '',
  address2: '',
  villageOrTown: '',
  pinCode: '',
  state: '3', // Default to Punjab
  district: '',
  tehsil: '',
  panPreviewUrl: '',
  isSubmitting: false
};

export const DEFAULT_PROJECT_SITE_ERRORS: ProjectSiteFormErrors = {};