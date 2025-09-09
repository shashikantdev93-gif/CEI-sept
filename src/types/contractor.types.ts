export interface WorkingArea {
  id: string | number;                    // Keep for backward compatibility
  tehsilLevelUserMappingId: number;       // ✅ Required for deletion API
  district: string;                       // React naming
  tehsil: string;                         // React naming
  districtName?: string;                  // Angular naming compatibility
  tehsilName?: string;                    // Angular naming compatibility
  districtRefId: number;                  // Required for validation
  tehsilRefId: number;                    // Required for validation
  appRefId?: number;                      // Required for API calls
  action: string;
}

export interface WorkingAreaDuplicateCheck {
  districtRefId: number;
  tehsilRefId: number;
  districtName: string;
  tehsilName: string;
}

export interface WorkingAreaPayload {
  tehsilLevelUserMappingId: number;
  appRefId: number;
  districtRefId: number;
  tehsilRefId: number;
  createdOnDate: string;
  lastModifiedOnDate: string;
  districtName: string;
  tehsilName: string;
}

export interface WorkingAreaResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface ApplicationActionPayload {
  appActionId: number;
  appActionType: number;
  sender_UserRefId: number;
  sender_ProfileRefId: number;
  receiver_UserRefId: number;
  receiver_ProfileRefId: number;
  actionOnDate: string;
  actionTakenDaysCount: number;
  remarks: string;
  senderRoleId: number;
  receiverRoleId: number;
  isDocumentUploaded: boolean;
  appDocumentRefId: number;
  applicationRefId: number;
  ipAddress?: string;
  latitude?: string;
  longitude?: string;
}

export interface ApplicationActionResponse {
  success: boolean;
  message?: string;
  data?: any;
}


export interface Instrument {
  id: number;
  instrumentType: string;
  instrumentSerialNo: string;
  instrumentMake: string;
  instrumentRange: string;
  district: string;
  tehsil: string;
  action: string;
}

export interface Partner {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  photo: string;
  pan: string;
  panNo: string;
  action: string;
}

export interface ContractorApplicationPayload {
  contractorApplicationId: number;
  appRefId: number | null;
  applicant_name: string;
  address: string;
  panCardNumber: string;
  contractorType: number;
  currentWorkingVoltage: number;
  signeeNameOnBehalfOfCompany?: string;
  businessEntity?: string;
  businessEntityAddress?: string;
  createdOnDate: string;
  lastModifiedOnDate: string;
}

export interface ContractorApplicationResponse {
  success: boolean;
  message: string;
  data: {
    contractorApplicationId: number;
    appRefId: number;
    applicant_name: string;
    address: string;
    panCardNumber: string;
    contractorType: number;
    currentWorkingVoltage: number;
    createdOnDate: string;
    lastModifiedOnDate: string;
  };
}

export interface ContractorFormState {
  name: string;
  address: string;
  panNumber: string;
  contractorType: string;
  currentWorkingVoltage: string;
  signeeNameOnBehalfOfCompany: string;
  businessEntity: string;
  businessEntityAddress: string;
  workingAreas: WorkingArea[];
  instruments: Instrument[];
  partners: Partner[];
  workingOnDistrict: number | "";
  workingOnTehsil: number | "";
  applicationId: number | null;
  isInitialLoad: boolean;
  saveSuccess: string | null;
  saveError: string | null;
}

export interface InstrumentPayload {
  contactInstrumentId: number;
  appRefId: number | null;
  applicationInstrumentsType: number;
  instrumentSerialNo: string;
  instrumentMakeBy: string;
  instrumentStartRange: string;
  instrumentEndRange: string;
  applicationInstrumentRange: number;
  isActive: boolean;
  isDeleted: boolean;
  createdOnDate: string;
  lastModifiedOnDate: string;
  districtRefId: number;
  districtName: string;
  tehsilRefId: number;
  tehsilName: string;
}

export interface PartnerPayload {
  contactPartnershipId: number;
  appRefId: number;
  contrPartnerName: string;
  contrPartnerEmail: string;
  contrPartnerContactNo: string;
  contrPartnerPhoto: string;
  panNoPhoto: string;
  panNo: string;
  isActive: boolean;
  isDeleted: boolean;
  createdOnDate: string;
  lastModifiedOnDate: string;
}

// Application State Management
export interface ApplicationState {
  appId?: number;
  iterationCount?: number;
  isLocked?: boolean;
  isAllowEdit?: boolean;
  applicationLifeCycleStatusType?: number;
}

export interface ApplicationDetailsPayload {
  appId: number;
  applicationType: number;
  applicationPurposeType: number;
  iterationCount: number;
  createdOnDate: string;
  lastModifiedOnDate: string;
  isEnabled: boolean;
  isDeleted: boolean;
  isLocked: boolean;
  isAllowEdit: boolean;
  isFeeApplicable: boolean;
  isOnline: boolean;
  applicationLifeCycleStatusType: number;
  applicationLifeCycleLastStatusOn: string;
  isLegacyData: boolean;
  projectSiteRefId: number;
  publicAppRefNum: string;
}

export type ContractorFormMode = 'new' | 'renew' | 'renew_first';