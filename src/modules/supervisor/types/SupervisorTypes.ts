/**
 * Supervisor Module Types
 * Phase 2 - Modular Architecture
 * 
 * TypeScript interfaces and types for supervisor-related data structures
 */

// ===== SUPERVISOR FORM DATA (MATCHING EXISTING TYPES) =====
export interface SupervisorFormData {
  fullName: string;
  licenceNo: string;
  licenceValidUpto: string;
  panNo: string;
  licenceDocument: string;
  panNoDocument: string;
  districtRefId: string;
  tehsilRefId: string;
}

export interface WiremanFormData {
  fullName: string;
  licenceNo: string;
  licenceValidUpto: string;
  panNo: string;
  licenceDocument: string;
  panNoDocument: string;
  districtRefId: string;
  tehsilRefId: string;
}

// ===== SUPERVISOR VALIDATION ERRORS (MATCHING EXISTING TYPES) =====
export interface SupervisorFormErrors {
  [key: string]: string;
}

export interface WiremanFormErrors {
  [key: string]: string;
}

// ===== API RESPONSE TYPES (MATCHING EXISTING TYPES) =====
export interface SupervisorApiData {
  id: number;
  fullName: string;
  licenceNo: string;
  licenceValidUpto: string;
  panNo: string;
  districtRefId: number;
  districtName: string;
  tehsilRefId: number;
  tehsilName: string;
  isOnline: boolean;
  licenceDocument: string;
  panNoDocument: string;
  contractorLicenceRefId: number;
  licenceExpired?: boolean;
}

export interface WiremanApiData {
  id: number;
  fullName: string;
  licenceNo: string;
  licenceValidUpto: string;
  panNo: string;
  districtRefId: number;
  districtName: string;
  tehsilRefId: number;
  tehsilName: string;
  isOnline: boolean;
  licenceDocument: string;
  panNoDocument: string;
  contractorLicenceRefId: number;
  licenceExpired?: boolean;
}

// ===== APPLICATION CONTEXT =====
export interface SupervisorApplicationContext {
  workingAreaList: any[];
  contractorFormMode: string;
  selectedWorkingAreaDistrictsList: any[];
  appRefId: number;
  contractorLicenceId: number;
  applicationContractorType: string;
  applicationIsLocked: boolean;
  renewAppId?: number;
  is30DaysCrossed?: boolean;
}

// ===== PAGE DATA =====
export interface SupervisorPageData {
  totalSupervisors: number;
  totalWiremans: number;
  maxSupervisors: number;
  maxWiremans: number;
  isLoading: boolean;
  hasExpiredSupervisors: boolean;
  hasExpiredWiremans: boolean;
}

// ===== TABLE DATA FORMATS =====
export interface FormattedSupervisorForTable {
  supervisorData: SupervisorApiData;
  certificateNumber: string;
  name: string;
  experience: string;
  expiryDate: string;
  district: string;
  tehsil: string;
  isExpired: boolean;
  status: string;
}

export interface FormattedWiremanForTable {
  wiremanData: WiremanApiData;
  permitNumber: string;
  name: string;
  experience: string;
  expiryDate: string;
  district: string;
  tehsil: string;
  isExpired: boolean;
  status: string;
}

// ===== API REQUEST/RESPONSE =====
export interface SupervisorApiResponse {
  success: boolean;
  data?: SupervisorApiData[] | WiremanApiData[];
  message?: string;
  errors?: any;
}

export interface SupervisorSaveRequest {
  appRefId: number;
  supervisors: Omit<SupervisorApiData, 'id'>[];
  wiremans: Omit<WiremanApiData, 'id'>[];
}

// ===== BUSINESS LOGIC HOOK INTERFACE =====
export interface UseSupervisorBusinessLogicProps {
  appRefId?: number;
}

export interface UseSupervisorBusinessLogicReturn {
  // Application Context
  applicationContext: SupervisorApplicationContext | null;
  setApplicationContext: (context: SupervisorApplicationContext | null) => void;
  
  // Form Data
  supervisorForm: SupervisorFormData;
  wiremanForm: WiremanFormData;
  setSupervisorForm: (form: SupervisorFormData) => void;
  setWiremanForm: (form: WiremanFormData) => void;
  
  // Validation
  supervisorErrors: SupervisorFormErrors;
  wiremanErrors: WiremanFormErrors;
  validateSupervisorForm: () => boolean;
  validateWiremanForm: () => boolean;
  isValidatingSupervisor: boolean;
  isValidatingWireman: boolean;
  
  // Data Management
  existingSupervisorsFromAPI: SupervisorApiData[];
  existingWiremansFromAPI: WiremanApiData[];
  supervisorsList: FormattedSupervisorForTable[];
  wiremansList: FormattedWiremanForTable[];
  
  // Page Data
  totalSupervisors: number;
  totalWiremans: number;
  maxSupervisors: number;
  maxWiremans: number;
  isLoading: boolean;
  hasExpiredSupervisors: boolean;
  hasExpiredWiremans: boolean;
  
  // Actions
  handleAddSupervisor: () => Promise<void>;
  handleAddWireman: () => Promise<void>;
  handleDeleteSupervisor: (id: number) => void;
  handleDeleteWireman: (id: number) => void;
  handleSaveAndNext: () => Promise<void>;
  
  // Form Actions
  handleSupervisorFieldChange: (field: string, value: string) => void;
  handleWiremanFieldChange: (field: string, value: string) => void;
  handleSupervisorCertificateChange: (file: File | null) => void;
  handleWiremanCertificateChange: (file: File | null) => void;
  
  // State Management
  isSupervisorOffline: boolean;
  isWiremanOffline: boolean;
  setIsSupervisorOffline: (offline: boolean) => void;
  setIsWiremanOffline: (offline: boolean) => void;
  isAddingSupervisor: boolean;
  isAddingWireman: boolean;
  setIsAddingSupervisor: (adding: boolean) => void;
  setIsAddingWireman: (adding: boolean) => void;
  
  // Data Loading
  loadExistingSupervisorWiremanData: () => Promise<void>;
  refreshData: () => void;
  
  // Utility
  clearSupervisorOnlineErrors: () => void;
  clearWiremanOnlineErrors: () => void;
  validateField: (field: string, value: string, type: 'supervisor' | 'wireman') => void;
}