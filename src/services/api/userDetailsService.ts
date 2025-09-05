import { axiosInterceptor } from '../../lib/interceptor';
import type { ApiResponse } from '../../types/common';

// Basic Interfaces
interface GenerateOTPPayload {
  mobileNumber: string;
  userId: number;
}


export interface CreateApplicationPayload {
  name: string;
  address: string;
  panNumber: string;
  contractorType: string;
  currentWorkingVoltage: string;
  // ... other fields
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

// Project Site Data Interface
export interface ProjectSiteData {
  users?: {
    userProfileMapping?: {
      userProfile?: {
        name?: string;
        address?: string;
        panNumber?: string;
      };
    };
  };
  applicantPanNumber?: string;
}

// Contractor Related Interfaces
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

// Response Interfaces
export interface ContractorApplicationResponse {
  success: boolean;
  message: string;
  data?: {
    appRefId: number;               // ← Changed from applicationId to appRefId
    contractorApplicationId: number;
    applicant_name: string;
    address: string;
    panCardNumber: string;
    contractorType: number;
    currentWorkingVoltage: number;
    createdOnDate: string;
    lastModifiedOnDate: string;
  };
  error?: string;
}

export interface WorkingAreaResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface PartnerResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface InstrumentResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface PANValidationResponse {
  formModel: any;
  success?: boolean;
  message?: string;
}

export interface InstrumentValidationResponse {
  formModel: any[];
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

export interface ProjectSiteDetailsResponse {
  formModel?: {
    projectSiteId?: number;
    projectSiteApplicationType?: number;
    state?: number;
    villageOrTown?: string;
    address1?: string;
    address2?: string;
    tehsilRefId?: number;
    districtRefId?: number;
    pinCode?: number;
    applicantPanNumber?: string;
    userRefId?: number;
    users?: {
      userId?: number;
      userName?: string;
      userProfileMapping?: {
        userProfile?: {
          firstName?: string;
          lastName?: string;
          mobileNo?: string;
          email?: string;
          commuAddress1?: string;
          commuAddress2?: string;
        }
      }
    };
    applications?: any[];
  };
  combinedAgendaModel?: any;
  isEditAllowed?: boolean;
  isLocked?: boolean;
  hasError?: boolean;
  errorDesc?: string;
  applicationLifeCycleStatusType?: number;
}


export const userDetailsService = {
  // Basic User Services
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

  // Project Site Services
  async getProjectSiteData(): Promise<ApiResponse<ProjectSiteData>> {
    console.log('🔄 [USER-SERVICE] Fetching project site data');
    return axiosInterceptor.get<ProjectSiteData>('/ProjectSites/getProjectSitesData');
  },

  // Contractor Application Services

  async createApplication(payload: CreateApplicationPayload): Promise<ApiResponse<{applicationId: number}>> {
    console.log('🔄 [USER-SERVICE] Creating new application');
    return axiosInterceptor.post('/ContractorLicence/addUpdate_ApplicationDetails', payload);
  },

   async createContractorApplication(payload: ContractorApplicationPayload): Promise<ApiResponse<ContractorApplicationResponse>> {
    console.log('🔄 [CONTRACTOR-SERVICE] Creating contractor application with payload:', payload);
    
    try {
      const response = await axiosInterceptor.post<ContractorApplicationResponse>(
        '/ContractorLicence/addUpdate_ApplicationDetails',
        payload
      );
      
      console.log('✅ [CONTRACTOR-SERVICE] Contractor application created successfully:', response.data);
      return response;
    } catch (error) {
      console.error('❌ [CONTRACTOR-SERVICE] Error creating contractor application:', error);
      throw error;
    }
  },
  async saveContractorApplication(payload: ContractorApplicationPayload): Promise<ApiResponse<ContractorApplicationResponse>> {
    console.log('🔄 [USER-SERVICE] Saving contractor application:', payload);
    return axiosInterceptor.post<ContractorApplicationResponse>('/ContractorLicence/addUpdate_ApplicationDetails', payload);
  },

  async getContractorApplication(id: number): Promise<ApiResponse<SavedContractorData>> {
    console.log('🔄 [USER-SERVICE] Fetching contractor application:', id);
    return axiosInterceptor.get<SavedContractorData>(`/ContractorLicence/getContractorApplicationDetails_ById?id=${id}`);
  },

  async addWorkingArea(payload: WorkingAreaPayload): Promise<ApiResponse<WorkingAreaResponse>> {
    console.log('🔄 [USER-SERVICE] Adding working area with payload:', payload);
    
    try {
      const response = await axiosInterceptor.post<WorkingAreaResponse>(
        '/ContractorLicence/addUpdateContract_WorkingArea',
        payload
      );
      
      console.log('✅ [USER-SERVICE] Working area added successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error adding working area:', error);
      throw error;
    }
  },

  async getContractorApplicationDetailsById(applicationId: number): Promise<ApiResponse<any>> {
    console.log('🔄 [USER-SERVICE] Fetching contractor application details for ID:', applicationId);
    
    try {
      const response = await axiosInterceptor.get<any>(
        `/ContractorLicence/getContractorApplicationDetails_ById?id=${applicationId}`
      );
      
      console.log('✅ [USER-SERVICE] Contractor application details fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error fetching contractor application details:', error);
      throw error;
    }
  },

  async validatePANNumber(panNo: string): Promise<ApiResponse<PANValidationResponse>> {
    console.log('🔍 [USER-SERVICE] Validating PAN number:', panNo);
    return axiosInterceptor.get<PANValidationResponse>(`/ProjectSites/getProjectSitesPanDetails?panno=${panNo}`);
  },

  async validateInstrumentSerialNumber(serialNo: string): Promise<ApiResponse<InstrumentValidationResponse>> {
    console.log('🔧 [USER-SERVICE] Validating instrument serial number:', serialNo);
    return axiosInterceptor.get<InstrumentValidationResponse>(
      `/ContractorLicence/getContract_InstrumentDetails?instrumentSerialNo=${serialNo}`
    );
  },

  async addInstrument(payload: InstrumentPayload): Promise<ApiResponse<InstrumentResponse>> {
    console.log('🔧 [USER-SERVICE] Adding instrument:', payload);
    return axiosInterceptor.post<InstrumentResponse>('/ContractorLicence/addUpdateContract_InstrumentDetails', payload);
  },

  async addPartner(payload: PartnerPayload): Promise<ApiResponse<PartnerResponse>> {
    console.log('🤝 [USER-SERVICE] Adding partner:', payload);
    return axiosInterceptor.post<PartnerResponse>('/ContractorLicence/addUpdateContract_PartnerDetails', payload);
  },

  
  
};