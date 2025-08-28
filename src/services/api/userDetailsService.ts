import { axiosInterceptor } from '../../lib/interceptor';
import type { ApiResponse } from '../../types/common';

interface GenerateOTPPayload {
  mobileNumber: string;
  userId: number;
}

interface UserDetailsPayload {
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
  userRefId: number;
}

interface OTPResponse {
  success: boolean;
  result?: string;
  message?: string;
}

interface UserDetailsResponse {
  applicationInitiateResponse?: {
    userProfileId: number;
    projectSiteId: number;
    appId: string;
  };
  customValidationResult?: {
    hasException: boolean;
    message: string;
  };
}

export interface ContractorApplicationPayload {
  name: string;
  address: string;
  panNumber: string;
  contractorType: string;
  currentWorkingVoltage: string;
  signeeNameOnBehalfOfCompany: string;
  businessEntity?: string;
  businessEntityAddress?: string;
  workingAreas: Array<{
    districtCode: number;
    districtName: string;
    tehsilId: number;
    tehsilName: string;
  }>;
  partners?: Array<{
    name: string;
    email: string;
    mobileNumber: string;
    photo: string;
    pan: string;
    panNo: string;
  }>;
  instruments: Array<{
    instrumentType: string;
    instrumentSerialNo: string;
    instrumentMake: string;
    instrumentRangeFrom: string;
    instrumentRangeTo: string;
    instrumentRangeUnit: string;
    districtCode: number;
    districtName: string;
    tehsilId: number;
    tehsilName: string;
  }>;
}

// Interface for API response
export interface ContractorApplicationResponse {
  success: boolean;
  message: string;
  data?: {
    applicationId: number;
    status: string;
  };
  error?: string;
}

// Interface for working area payload (matching Angular structure exactly)
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

// Interface for working area API response
export interface WorkingAreaResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Interface for partner payload (matching Angular structure exactly)
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

// Interface for PAN validation response
export interface PANValidationResponse {
  formModel: any;
  success?: boolean;
  message?: string;
}

// Interface for partner response
export interface PartnerResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Interface for instrument payload (matching Angular structure exactly)
export interface InstrumentPayload {
  contactInstrumentId: number;
  appRefId: number;
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

// Interface for instrument validation response
export interface InstrumentValidationResponse {
  formModel: any[];
}

// Interface for instrument response
export interface InstrumentResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Interface for fetching saved data
export interface SavedContractorData {
  applicationId: number;
  name: string;
  address: string;
  panNumber: string;
  contractorType: string;
  currentWorkingVoltage: string;
  signeeNameOnBehalfOfCompany: string;
  businessEntity?: string;
  businessEntityAddress?: string;
  workingAreas: Array<{
    id: number;
    districtCode: number;
    districtName: string;
    tehsilId: number;
    tehsilName: string;
  }>;
  partners: Array<{
    id: number;
    name: string;
    email: string;
    mobileNumber: string;
    photo: string;
    pan: string;
    panNo: string;
  }>;
  instruments: Array<{
    id: number;
    instrumentType: string;
    instrumentSerialNo: string;
    instrumentMake: string;
    instrumentRangeFrom: string;
    instrumentRangeTo: string;
    instrumentRangeUnit: string;
    districtCode: number;
    districtName: string;
    tehsilId: number;
    tehsilName: string;
  }>;
}

export interface ContractorApplicationPayload {
  name: string;
  address: string;
  panNumber: string;
  contractorType: string;
  currentWorkingVoltage: string;
  signeeNameOnBehalfOfCompany: string;
  businessEntity?: string;
  businessEntityAddress?: string;
  workingAreas: Array<{
    districtCode: number;
    districtName: string;
    tehsilId: number;
    tehsilName: string;
  }>;
  partners?: Array<{
    name: string;
    email: string;
    mobileNumber: string;
    photo: string;
    pan: string;
    panNo: string;
  }>;
  instruments: Array<{
    instrumentType: string;
    instrumentSerialNo: string;
    instrumentMake: string;
    instrumentRangeFrom: string;
    instrumentRangeTo: string;
    instrumentRangeUnit: string;
    districtCode: number;
    districtName: string;
    tehsilId: number;
    tehsilName: string;
  }>;
}

export interface ContractorApplicationResponse {
  success: boolean;
  message: string;
  data?: {
    applicationId: number;
    status: string;
  };
  error?: string;
}

export interface SavedContractorData {
  applicationId: number;
  name: string;
  address: string;
  panNumber: string;
  contractorType: string;
  currentWorkingVoltage: string;
  signeeNameOnBehalfOfCompany: string;
  businessEntity?: string;
  businessEntityAddress?: string;
  workingAreas: Array<{
    id: number;
    districtCode: number;
    districtName: string;
    tehsilId: number;
    tehsilName: string;
  }>;
  partners: Array<{
    id: number;
    name: string;
    email: string;
    mobileNumber: string;
    photo: string;
    pan: string;
    panNo: string;
  }>;
  instruments: Array<{
    id: number;
    instrumentType: string;
    instrumentSerialNo: string;
    instrumentMake: string;
    instrumentRangeFrom: string;
    instrumentRangeTo: string;
    instrumentRangeUnit: string;
    districtCode: number;
    districtName: string;
    tehsilId: number;
    tehsilName: string;
  }>;
}

export const userDetailsService = {
  async generateOTP(payload: GenerateOTPPayload): Promise<ApiResponse<OTPResponse>> {
    console.log('🔄 [USER-SERVICE] Generating OTP for mobile:', payload.mobileNumber);
    return axiosInterceptor.post<OTPResponse>('/ProjectSites/generateOtp', payload);
  },

  async getClientId(): Promise<ApiResponse<string>> {
    console.log('🔄 [USER-SERVICE] Getting client ID');
    return axiosInterceptor.get<string>('/CommonApis/getClientId');
  },

  async saveUserDetails(payload: UserDetailsPayload): Promise<ApiResponse<UserDetailsResponse>> {
    console.log('🔄 [USER-SERVICE] Saving user details');
    return axiosInterceptor.post<UserDetailsResponse>('/UserDetails/addUpdate_UserDetails', payload);
  },

  async saveContractorApplication(payload: ContractorApplicationPayload): Promise<ApiResponse<ContractorApplicationResponse>> {
    console.log('🔄 [USER-SERVICE] Saving contractor application:', payload);
    
    try {
      const response = await axiosInterceptor.post<ContractorApplicationResponse>(
        '/addUpdate_ApplicationDetails',
        payload
      );
      
      console.log('✅ [USER-SERVICE] Contractor application saved successfully:', response);
      return response;
    } catch (error: any) {
      console.error('❌ [USER-SERVICE] Error saving contractor application:', error);
      throw error;
    }
  },

  async getContractorApplication(id: number): Promise<ApiResponse<SavedContractorData>> {
    console.log('🔄 [USER-SERVICE] Fetching contractor application for ID:', id);
    
    try {
      const response = await axiosInterceptor.get<SavedContractorData>(
        `getContractorApplicationDetails_ById?id=${id}`
      );
      
      console.log('✅ [USER-SERVICE] Contractor application fetched successfully:', response);
      return response;
    } catch (error: any) {
      console.error('❌ [USER-SERVICE] Error fetching contractor application:', error);
      throw error;
    }
  },

  // NEW METHOD: Add working area (matching Angular API exactly)
  async addWorkingArea(payload: WorkingAreaPayload): Promise<ApiResponse<WorkingAreaResponse>> {
    console.log('🔄 [USER-SERVICE] Adding working area:', payload);
    
    try {
      const response = await axiosInterceptor.post<WorkingAreaResponse>(
        '/ContractorLicence/addUpdateContract_WorkingArea',
        payload
      );
      
      console.log('✅ [USER-SERVICE] Working area added successfully:', response);
      return response;
    } catch (error: any) {
      console.error('❌ [USER-SERVICE] Error adding working area:', error);
      throw error;
    }
  },

  // NEW METHOD: Get contractor application details by ID (matching Angular API exactly)
  async getContractorApplicationDetailsById(id: number): Promise<ApiResponse<SavedContractorData>> {
    console.log('🔄 [USER-SERVICE] Fetching contractor application details for ID:', id);
    
    try {
      const response = await axiosInterceptor.get<SavedContractorData>(
        `/ContractorLicence/getContractorApplicationDetails_ById?id=${id}`
      );
      
      console.log('✅ [USER-SERVICE] Contractor application details fetched successfully:', response);
      return response;
    } catch (error: any) {
      console.error('❌ [USER-SERVICE] Error fetching contractor application details:', error);
      throw error;
    }
  },

  // NEW METHOD: Validate PAN number (matching Angular API exactly)
  async validatePANNumber(panNo: string): Promise<ApiResponse<PANValidationResponse>> {
    console.log('🔍 [USER-SERVICE] Validating PAN number:', panNo);
    console.log('🔍 [USER-SERVICE] API endpoint: ProjectSites/getProjectSitesPanDetails');
    console.log('🔍 [USER-SERVICE] API payload:', { panno: panNo });
    
    try {
      const response = await axiosInterceptor.get<PANValidationResponse>(
        `/ProjectSites/getProjectSitesPanDetails?panno=${panNo}`
      );
      
      console.log('📥 [USER-SERVICE] PAN validation response received:', response);
      console.log('📥 [USER-SERVICE] Response formModel:', response.data?.formModel);
      console.log('📥 [USER-SERVICE] Is PAN already exists:', response.data?.formModel !== null);
      
      return response;
    } catch (error: any) {
      console.error('❌ [USER-SERVICE] Error validating PAN number:', error);
      throw error;
    }
  },

  // NEW METHOD: Add partner (matching Angular API exactly)
  async addPartner(payload: PartnerPayload): Promise<ApiResponse<PartnerResponse>> {
    console.log('🤝 [USER-SERVICE] Adding partner:', payload);
    console.log('🌐 [USER-SERVICE] API Controller: ContractorLicence');
    console.log('🌐 [USER-SERVICE] API Action: addUpdateContract_PartnerDetails');
    console.log('🌐 [USER-SERVICE] Full API URL: /ContractorLicence/addUpdateContract_PartnerDetails');
    console.log('🌐 [USER-SERVICE] HTTP Method: POST');
    console.log('📤 [USER-SERVICE] RAW PAYLOAD (before encryption):', JSON.stringify(payload, null, 2));
    
    try {
      const response = await axiosInterceptor.post<PartnerResponse>(
        '/ContractorLicence/addUpdateContract_PartnerDetails',
        payload
      );
      
      console.log('📥 [USER-SERVICE] Partner creation response:', response);
      console.log('📥 [USER-SERVICE] Response type:', typeof response.data);
      console.log('📥 [USER-SERVICE] Response keys:', response.data ? Object.keys(response.data) : 'No keys (null/undefined response)');
      
      return response;
    } catch (error: any) {
      console.error('❌ [USER-SERVICE] Error adding partner:', error);
      throw error;
    }
  },

  // NEW METHOD: Validate instrument serial number (matching Angular API exactly)
  async validateInstrumentSerialNumber(serialNo: string): Promise<ApiResponse<InstrumentValidationResponse>> {
    console.log('🔧 [USER-SERVICE] ===== CHECKING DUPLICATE INSTRUMENT SERIAL NUMBER =====');
    console.log('🔧 [USER-SERVICE] Serial number to check:', serialNo);
    console.log('🔧 [USER-SERVICE] API endpoint: ContractorLicence/getContract_InstrumentDetails');
    console.log('🔧 [USER-SERVICE] API payload:', { instrumentSerialNo: serialNo });
    
    try {
      const response = await axiosInterceptor.get<InstrumentValidationResponse>(
        `/ContractorLicence/getContract_InstrumentDetails?instrumentSerialNo=${serialNo}`
      );
      
      console.log('📥 [USER-SERVICE] ===== DUPLICATE CHECK API RESPONSE =====');
      console.log('📥 [USER-SERVICE] Response data:', response);
      console.log('📥 [USER-SERVICE] formModel length:', response.data?.formModel?.length || 0);
      console.log('📥 [USER-SERVICE] Is serial number duplicate:', (response.data?.formModel?.length || 0) > 0);
      
      return response;
    } catch (error: any) {
      console.error('❌ [USER-SERVICE] Error validating instrument serial number:', error);
      throw error;
    }
  },

  // NEW METHOD: Add instrument (matching Angular API exactly)
  async addInstrument(payload: InstrumentPayload): Promise<ApiResponse<InstrumentResponse>> {
    console.log('🔧 [USER-SERVICE] Adding instrument:', payload);
    console.log('🌐 [USER-SERVICE] API Controller: ContractorLicence');
    console.log('🌐 [USER-SERVICE] API Action: addUpdateContract_InstrumentDetails');
    console.log('🌐 [USER-SERVICE] Full API URL: /ContractorLicence/addUpdateContract_InstrumentDetails');
    console.log('🌐 [USER-SERVICE] HTTP Method: POST');
    console.log('📤 [USER-SERVICE] RAW PAYLOAD (before encryption):', JSON.stringify(payload, null, 2));
    
    try {
      const response = await axiosInterceptor.post<InstrumentResponse>(
        '/ContractorLicence/addUpdateContract_InstrumentDetails',
        payload
      );
      
      console.log('📥 [USER-SERVICE] ===== ADD INSTRUMENT API RESPONSE =====');
      console.log('📥 [USER-SERVICE] Response data:', response);
      console.log('📥 [USER-SERVICE] Response status:', response.status);
      console.log('📥 [USER-SERVICE] Response type:', typeof response.data);
      console.log('📥 [USER-SERVICE] Response keys:', response.data ? Object.keys(response.data) : 'No keys (null/undefined response)');
      
      return response;
    } catch (error: any) {
      console.error('❌ [USER-SERVICE] Error adding instrument:', error);
      throw error;
    }
  }
};



