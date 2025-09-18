/**
 * Contractor Module Types - Phase 2 Refactoring
 * 
 * TypeScript interfaces for contractor-related data structures
 * ✅ Maintains exact same structure as original component expects
 */

// ✅ Working Area Types (Angular naming: workingAreaList)
export interface WorkingArea {
  id?: number;
  districtName: string;
  tehsilName: string;
  districtCode: string;
  tehsilCode: string;
}

// ✅ Instrument Types  
export interface Instrument {
  id?: number;
  instrumentType: string;
  instrumentSerialNo: string;
  instrumentMake: string;
  instrumentRange: string;
  district: string;
  tehsil: string;
}

// ✅ Partner Types
export interface Partner {
  id?: number;
  partnerName: string;
  partnerEmail: string;
  partnerContactNumber: string;
  partnerPhoto?: File;
  uploadPan?: File;
  panNo: string;
}

// ✅ Application Data Structure (Angular parity)
export interface ApplicationData {
  contractorLicenceId?: number;
  apprefId?: number;
  applicant_name: string;
  address: string;
  panCardNumber: string;
  contractorType: string;
  currentWorkingVoltage: string;
  signeeNameOnBehalfOfCompany?: string;
  businessEntity?: string;
  businessEntityAddress?: string;
  workingAreaList: WorkingArea[];
  instruments: Instrument[];
  partners: Partner[];
}

// ✅ Form Errors Structure
export interface FormErrors {
  [fieldName: string]: string;
}

// ✅ Loading States
export interface LoadingStates {
  districts: boolean;
  tehsils: boolean;
  application: boolean;
  saving: boolean;
}

// ✅ Location Error States  
export interface LocationErrors {
  districts?: string;
  tehsils?: string;
}

// ✅ Hook Return Type (must match original component expectations)
export interface UseContractorBusinessLogicReturn {
  // Form States
  applicant_name: string;
  address: string; 
  panCardNumber: string;
  contractorType: string;
  currentWorkingVoltage: string;
  signeeNameOnBehalfOfCompany: string;
  businessEntity: string;
  businessEntityAddress: string;

  // Setters (same names as original)
  setApplicantName: (value: string) => void;
  setAddress: (value: string) => void;
  setPanCardNumber: (value: string) => void;
  setSigneeNameOnBehalfOfCompany: (value: string) => void;
  setBusinessEntity: (value: string) => void;
  setBusinessEntityAddress: (value: string) => void;

  // Working Area States
  workingOnDistrict: string;
  workingOnTehsil: string;
  workingAreaList: WorkingArea[];
  workingAreaFormErrors: FormErrors;
  isAddingWorkingArea: boolean;

  // Instrument States
  instrument: string;
  instrumentSerialNo: string;
  instrumentMake: string;
  instrumentRangeFrom: string;
  instrumentRangeTo: string;
  instrumentRangeUnit: string;
  instrumentDistrict: string;
  instrumentTehsil: string;
  instruments: Instrument[];
  selectedInstrumentList: any[];
  isAddingInstrument: boolean;
  instrumentFormErrors: FormErrors;

  // Partner States
  partnerName: string;
  partnerEmail: string;
  partnerContactNumber: string;
  partnerPhoto: File | null;
  uploadPan: File | null;
  panNo: string;
  partners: Partner[];
  partnerPhotoPreviewUrl: string;
  uploadPanPreviewUrl: string;

  // Application States
  isInitialLoad: boolean;
  saveSuccess: boolean;
  saveError: string;
  
  // Location States
  districts: any[];
  tehsils: any[];
  loading: LoadingStates;
  locationErrors: LocationErrors;
  projectSiteLoading: boolean;
  projectSiteError: string;

  // Handler Functions (same names as original)
  handleWorkingDistrictChange: (districtCode: string) => void;
  handleInstrumentDistrictChange: (districtCode: string) => void;
  handleInstrumentTehsilChange: (tehsilCode: string) => void;
  handleContractorTypeChange: (type: string) => void;
  handleCurrentWorkingVoltageChange: (voltage: string) => void;
  handleWorkingTehsilChange: (tehsilCode: string) => void;
  addWorkingArea: () => void;
  handleAddInstrumentDetails: () => void;
  handleAddPartner: () => void;
  handleDeleteWorkingArea: (id: number) => void;
  handleDeleteInstrument: (id: number) => void;
  handleDeletePartner: (id: number) => void;
  handleFileUploaded: (file: File, fieldName: string) => void;
  handleInstrumentSerialNoChange: (value: string) => void;
  handleInstrumentSerialNoBlur: () => void;
  handleInstrumentMakeChange: (value: string) => void;

  // Refresh function (Angular naming)
  getContractorApplicationDetails: () => void;

  // Application management  
  apprefId: number | null;
  contractorLicenceId: number | null;
  applicationLicenceId: number | null;

  // Field State Management
  applicationData: ApplicationData;
  hideContractorElementsForLockPage: boolean;
  isFormDisabled: boolean;
  areFieldsDisabled: boolean;
  fieldStateDebug: any;

  // Business Logic Functions (Phase 2 additions)
  handleSaveAndContinue: () => void;
  handleDraftSave: () => void;
  handleFormSubmission: (submissionType: 'draft' | 'final') => Promise<void>;
  handleNavigateBack: () => void;
  handleNavigateNext: () => void;
  validateCurrentStep: () => boolean;
  handleApiError: (error: any, context: string) => void;
  handleApiSuccess: (response: any, context: string) => void;
  
  // Computed Values
  isReadyForSubmission: boolean;
  formMode: 'create' | 'edit';
  isEditMode: boolean;
  isCreateMode: boolean;
}

// ✅ API Response Types
export interface ContractorApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export type { UseContractorBusinessLogicReturn as default };