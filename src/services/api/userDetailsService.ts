import { axiosInterceptor } from '../../lib/interceptor';
import type { ApiResponse } from '../../types/common';
import type { 
  ApplicationDetailsPayload, 
  WorkingAreaPayload, 
  WorkingAreaResponse, 
  ApplicationActionPayload, 
  ApplicationActionResponse,
  InstrumentPayload,
  InstrumentResponse,
  PartnerPayload,
  PartnerResponse
} from '../../types/contractor.types';

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
}

// Supervisor/Wireman API Interfaces
interface SupervisorAPIResponse {
  formModel: Array<{
    id: number;
    userProfile: {
      firstName: string;
      middleName?: string;
      lastName: string;
    };
    licenceValidOnUpToDate: string;
    application: {
      projectSites: {
        applicantPanNumber: string;
      };
    };
  }>;
}

interface WiremanAPIResponse {
  formModel: Array<{
    id: number;
    userProfile: {
      firstName: string;
      middleName?: string;
      lastName: string;
    };
    licenceValidOnUpToDate: string;
    application: {
      projectSites: {
        applicantPanNumber: string;
      };
    };
  }>;
}

export interface OTPResponse {
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

// Response Interfaces
export interface ContractorApplicationResponse {
  success: boolean;
  message: string;
  data?: {
    appRefId: number;              
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

  async getApplicationTypeAllowDoc(appRefId: number, deleteTempFiles: boolean = true): Promise<ApiResponse<any[]>> {
    console.log('🔄 [USER-SERVICE] Getting application type allowed documents for appRefId:', appRefId);
    const queryParams = new URLSearchParams({
      id: appRefId.toString(),
      deleteTempFiles: deleteTempFiles.toString()
    });
    
    return axiosInterceptor.get<any[]>(`/CommonApis/getApplicationTypeAllowDoc?${queryParams}`);
  },

  async saveUserDetails(payload: UserDetailsPayload): Promise<ApiResponse<UserDetailsResponse>> {
    console.log('🔄 [USER-SERVICE] Saving user details');
    return axiosInterceptor.post<UserDetailsResponse>('/UserDetails/addUpdate_UserDetails', payload);
  },

  // Project Site Services
  async getProjectSiteData(): Promise<ApiResponse<ProjectSiteData>> {
    console.log('🔄 [USER-SERVICE] Fetching project site data');
    return axiosInterceptor.get<ProjectSiteData>('/createApplicationDetails/getProjectSitesData');
  },

  // Contractor Application Services

  async createApplicationDetails(payload: ApplicationDetailsPayload): Promise<ApiResponse<any>> {
  console.log('🔄 [USER-SERVICE] Creating application details with payload:', payload);
  console.log('🔄 [USER-SERVICE] API endpoint: /Application/addUpdate_ApplicationDetails');
  console.log('🔄 [USER-SERVICE] HTTP method: POST');
  
  try {
    const response = await axiosInterceptor.post<any>(
      '/Application/addUpdate_ApplicationDetails', // ← This is the correct endpoint (not ContractorLicence)
      payload
    );
    
    console.log('✅ [USER-SERVICE] Application details created successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ [USER-SERVICE] Error creating application details:', error);
    throw error;
  }
},

  /**
   * Creates or updates contractor working area
   * @param payload - Working area payload
   * @returns Promise with working area response
   */
  async createContractorWorkingArea(payload: WorkingAreaPayload): Promise<ApiResponse<WorkingAreaResponse>> {
    console.log('🔄 [USER-SERVICE] Creating contractor working area with payload:', payload);
    console.log('🔄 [USER-SERVICE] API endpoint: /ContractorLicence/addUpdateContract_WorkingArea');
    console.log('🔄 [USER-SERVICE] HTTP method: POST');

    try {
      const response = await axiosInterceptor.post<WorkingAreaResponse>(
        '/ContractorLicence/addUpdateContract_WorkingArea',
        payload
      );

      console.log('✅ [USER-SERVICE] Working area creation response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error creating working area:', error);
      throw error;
    }
  },

  /**
   * Creates or updates application action (required for proper application lifecycle)
   * @param payload - Application action payload
   * @returns Promise with application action response
   */
  async createApplicationAction(payload: ApplicationActionPayload): Promise<ApiResponse<ApplicationActionResponse>> {
    console.log('🔄 [USER-SERVICE] Creating application action with payload:', payload);
    console.log('🔄 [USER-SERVICE] API endpoint: /Application/addUpdate_ApplicationAction');
    console.log('🔄 [USER-SERVICE] HTTP method: POST');

    try {
      const response = await axiosInterceptor.post<ApplicationActionResponse>(
        '/Application/addUpdate_ApplicationAction',
        payload
      );

      console.log('✅ [USER-SERVICE] Application action creation response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error creating application action:', error);
      throw error;
    }
  },

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

  /**
   * Deletes contractor working area (Angular parity)
   * @param workingTehsilId - Working area ID to delete (Angular parameter name)
   * @returns Promise with delete response
   */
  async deleteContractorWorkingArea(workingTehsilId: number): Promise<ApiResponse<any>> {
    console.log('🗑️ [USER-SERVICE] Deleting contractor working area with ID:', workingTehsilId);
    console.log('🗑️ [USER-SERVICE] API endpoint: /ContractorLicence/deleteContractWorkingTehsil_ById');
    console.log('🗑️ [USER-SERVICE] HTTP method: GET (Angular parity - FIXED)');
    console.log('🗑️ [USER-SERVICE] Parameter format: Query string (Angular parity)');

    try {
      // ✅ FIX: Use Angular's exact method (GET) and query parameter format
      // ✅ CRITICAL: Angular uses GET request, not POST - this was causing 405 Method Not Allowed
      const response = await axiosInterceptor.get<any>(
        `/ContractorLicence/deleteContractWorkingTehsil_ById?workingTehsilId=${workingTehsilId}`
        // GET request with query parameter - exactly like Angular
      );

      console.log('✅ [USER-SERVICE] Working area deletion response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error deleting working area:', error);
      throw error;
    }
  },

  /**
   * Deletes contractor partner (Angular parity)
   * @param partnerId - Partner ID to delete (Angular: contactPartnershipId)
   * @returns Promise with delete response
   */
  async deletePartner(partnerId: number): Promise<ApiResponse<any>> {
    console.log('🗑️ [USER-SERVICE] Deleting partner with ID:', partnerId);
    console.log('🗑️ [USER-SERVICE] ===== ANGULAR PARITY IMPLEMENTATION =====');
    console.log('🗑️ [USER-SERVICE] Angular endpoint: ContractorLicence/deleteContractPartner_ById');
    console.log('🗑️ [USER-SERVICE] Angular method: GET (httpGet)');
    console.log('🗑️ [USER-SERVICE] Angular parameter: partnershipId (not partnerId!)');
    console.log('🗑️ [USER-SERVICE] Angular value: contactPartnershipId');

    try {
      // ✅ CRITICAL FIX: Angular uses 'partnershipId' parameter, not 'partnerId'
      const response = await axiosInterceptor.get<any>(
        `/ContractorLicence/deleteContractPartner_ById?partnershipId=${partnerId}`
      );

      console.log('✅ [USER-SERVICE] Partner deletion response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error deleting partner:', error);
      throw error;
    }
  },

  /**
   * Deletes contractor instrument (Angular parity)
   * @param instrumentId - Instrument ID to delete (Angular: contactInstrumentId)
   * @returns Promise with delete response
   */
  async deleteInstrument(instrumentId: number): Promise<ApiResponse<any>> {
    console.log('🗑️ [USER-SERVICE] Deleting instrument with ID:', instrumentId);
    console.log('🗑️ [USER-SERVICE] ===== ANGULAR PARITY IMPLEMENTATION =====');
    console.log('🗑️ [USER-SERVICE] Angular endpoint: ContractorLicence/deleteContractInstrumentDetails_ById');
    console.log('🗑️ [USER-SERVICE] Angular method: GET (httpGet)');
    console.log('🗑️ [USER-SERVICE] Angular parameter: instrumentId (query parameter)');

    try {
      // ✅ FIXED: Use exact Angular endpoint and method
      const response = await axiosInterceptor.get<any>(
        `/ContractorLicence/deleteContractInstrumentDetails_ById?instrumentId=${instrumentId}`
      );

      console.log('✅ [USER-SERVICE] Instrument deletion response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error deleting instrument:', error);
      throw error;
    }
  },

  /**
   * Checks if partner email already exists (Angular parity)
   * @param email - Email to check for uniqueness
   * @returns Promise with email check response
   */
  async checkPartnerEmailExists(email: string): Promise<ApiResponse<any>> {
    console.log('📧 [USER-SERVICE] Checking partner email exists:', email);
    console.log('📧 [USER-SERVICE] API endpoint: /ContractorLicence/checkPartnerEmailExists');
    console.log('📧 [USER-SERVICE] HTTP method: GET (Angular parity)');

    try {
      const response = await axiosInterceptor.get<any>(
        `/ContractorLicence/checkPartnerEmailExists?email=${encodeURIComponent(email)}`
      );

      console.log('✅ [USER-SERVICE] Partner email check response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error checking partner email:', error);
      throw error;
    }
  },

  /**
   * Checks if partner mobile number already exists (Angular parity)
   * @param mobile - Mobile number to check for uniqueness
   * @returns Promise with mobile check response
   */
  async checkPartnerMobileExists(mobile: string): Promise<ApiResponse<any>> {
    console.log('📱 [USER-SERVICE] Checking partner mobile exists:', mobile);
    console.log('📱 [USER-SERVICE] API endpoint: /ContractorLicence/checkPartnerMobileExists');
    console.log('📱 [USER-SERVICE] HTTP method: GET (Angular parity)');

    try {
      const response = await axiosInterceptor.get<any>(
        `/ContractorLicence/checkPartnerMobileExists?mobile=${mobile}`
      );

      console.log('✅ [USER-SERVICE] Partner mobile check response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error checking partner mobile:', error);
      throw error;
    }
  },

  /**
   * Checks if PAN number already exists (Angular parity)
   * @param panNumber - PAN number to check for uniqueness
   * @returns Promise with PAN check response
   */
  async checkPANExists(panNumber: string): Promise<ApiResponse<any>> {
    console.log('🔍 [USER-SERVICE] Checking PAN exists:', panNumber);
    console.log('🔍 [USER-SERVICE] API endpoint: /ProjectSites/getProjectSitesPanDetails');
    console.log('🔍 [USER-SERVICE] HTTP method: GET (Angular parity)');
    console.log('🔍 [USER-SERVICE] Parameter: panno (Angular naming)');

    try {
      const response = await axiosInterceptor.get<any>(
        `/ProjectSites/getProjectSitesPanDetails?panno=${panNumber.toUpperCase()}`
      );

      console.log('✅ [USER-SERVICE] PAN check response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error checking PAN:', error);
      throw error;
    }
  },

  // Supervisor certificate validation methods
  async getSupervisorDetails_ByLicenceNo(licenceNo: string): Promise<ApiResponse<SupervisorAPIResponse>> {
    console.log('🏆 [USER-SERVICE] Getting supervisor details by licence number:', licenceNo);
    console.log('🏆 [USER-SERVICE] API endpoint: /SupervisorLicence/getSupervisorDetails_ByLicenceNo');
    console.log('🏆 [USER-SERVICE] HTTP method: GET (Angular parity)');

    try {
      const response = await axiosInterceptor.get<SupervisorAPIResponse>(
        `/SupervisorLicence/getSupervisorDetails_ByLicenceNo`,
        {
          params: { licenceNo }
        }
      );

      console.log('✅ [USER-SERVICE] Supervisor details response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error getting supervisor details:', error);
      throw error;
    }
  },

  async getSuperBacklogDetailsByLicenceNo(licenceNo: string): Promise<ApiResponse<any>> {
    console.log('🏆 [USER-SERVICE] Getting supervisor backlog details by licence number:', licenceNo);
    console.log('🏆 [USER-SERVICE] API endpoint: /SupervisorLicence/getSuperBacklogDetailsByLicenceNo');
    console.log('🏆 [USER-SERVICE] HTTP method: GET (Angular parity)');

    try {
      const response = await axiosInterceptor.get<any>(
        `/SupervisorLicence/getSuperBacklogDetailsByLicenceNo`,
        {
          params: { LicenceNo: licenceNo }
        }
      );

      console.log('✅ [USER-SERVICE] Supervisor backlog details response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error getting supervisor backlog details:', error);
      throw error;
    }
  },

  // Wireman permit validation methods
  async getWiremanDetails_ByLicenceNo(licenceNo: string): Promise<ApiResponse<WiremanAPIResponse>> {
    console.log('⚡ [USER-SERVICE] Getting wireman details by licence number:', licenceNo);
    console.log('⚡ [USER-SERVICE] API endpoint: /WiremanLicence/getWiremanDetails_ByLicenceNo');
    console.log('⚡ [USER-SERVICE] HTTP method: GET (Angular parity)');

    try {
      const response = await axiosInterceptor.get<WiremanAPIResponse>(
        `/WiremanLicence/getWiremanDetails_ByLicenceNo`,
        {
          params: { licenceNo }
        }
      );

      console.log('✅ [USER-SERVICE] Wireman details response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error getting wireman details:', error);
      throw error;
    }
  },

  async getWireBacklogDetailsByLicenceNo(licenceNo: string): Promise<ApiResponse<any>> {
    console.log('⚡ [USER-SERVICE] Getting wireman backlog details by licence number:', licenceNo);
    console.log('⚡ [USER-SERVICE] API endpoint: /WiremanLicence/getWireBacklogDetailsByLicenceNo');
    console.log('⚡ [USER-SERVICE] HTTP method: GET (Angular parity)');

    try {
      const response = await axiosInterceptor.get<any>(
        `/WiremanLicence/getWireBacklogDetailsByLicenceNo`,
        {
          params: { LicenceNo: licenceNo }
        }
      );

      console.log('✅ [USER-SERVICE] Wireman backlog details response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error getting wireman backlog details:', error);
      throw error;
    }
  },

  // ====================
  // CRITICAL MISSING APIs - Angular Parity
  // ====================

  /**
   * Get contractor worker details by appRefId
   * Angular: ContractorLicence/getContractorWorkerDetails_ById
   */
  async getContractorWorkerDetails(appRefId: number): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 [USER-SERVICE] Getting contractor worker details for appRefId:', appRefId);
      
      const response = await axiosInterceptor.get(`/ContractorLicence/getContractorWorkerDetails_ById?id=${appRefId}`);
      
      console.log('✅ [USER-SERVICE] Contractor worker details response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error getting contractor worker details:', error);
      throw error;
    }
  },

  /**
   * Add/Update contractor supervisor
   * Angular: ContractorLicence/addUpdateContractSupervisor_BacklogDetails
   */
  async addUpdateContractSupervisor(payload: any): Promise<ApiResponse<any>> {
    try {
      console.log('🏗️ [USER-SERVICE] Adding/updating contractor supervisor:', payload);
      
      const response = await axiosInterceptor.post('/ContractorLicence/addUpdateContractSupervisor_BacklogDetails', payload);
      
      console.log('✅ [USER-SERVICE] Supervisor add/update response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error adding/updating supervisor:', error);
      throw error;
    }
  },

  /**
   * Add/Update contractor wireman
   * Angular: ContractorLicence/addUpdateContractWireman_BacklogDetails
   */
  async addUpdateContractWireman(payload: any): Promise<ApiResponse<any>> {
    try {
      console.log('🏗️ [USER-SERVICE] Adding/updating contractor wireman:', payload);
      
      const response = await axiosInterceptor.post('/ContractorLicence/addUpdateContractWireman_BacklogDetails', payload);
      
      console.log('✅ [USER-SERVICE] Wireman add/update response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error adding/updating wireman:', error);
      throw error;
    }
  },

  /**
   * Delete contractor supervisor
   * Angular: ContractorLicence/deleteContractSupervisorBacklog_ById
   */
  async deleteContractSupervisor(id: number): Promise<ApiResponse<any>> {
    try {
      console.log('🗑️ [USER-SERVICE] Deleting contractor supervisor with id:', id);
      
      const response = await axiosInterceptor.get(`/ContractorLicence/deleteContractSupervisorBacklog_ById?id=${id}`);
      
      console.log('✅ [USER-SERVICE] Supervisor delete response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error deleting supervisor:', error);
      throw error;
    }
  },

  /**
   * Delete contractor wireman
   * Angular: ContractorLicence/deleteContractWiremanBacklog_ById
   */
  async deleteContractWireman(id: number): Promise<ApiResponse<any>> {
    try {
      console.log('🗑️ [USER-SERVICE] Deleting contractor wireman with id:', id);
      
      const response = await axiosInterceptor.get(`/ContractorLicence/deleteContractWiremanBacklog_ById?id=${id}`);
      
      console.log('✅ [USER-SERVICE] Wireman delete response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error deleting wireman:', error);
      throw error;
    }
  },

  /**
   * Add/Update application details
   * Angular: Application/addUpdate_ApplicationDetails
   */
  async addUpdateApplicationDetails(payload: any): Promise<ApiResponse<any>> {
    try {
      console.log('📋 [USER-SERVICE] Adding/updating application details:', payload);
      
      const response = await axiosInterceptor.post('/Application/addUpdate_ApplicationDetails', payload);
      
      console.log('✅ [USER-SERVICE] Application details response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error with application details:', error);
      throw error;
    }
  },

  /**
   * Add/Update application action
   * Angular: Application/addUpdate_ApplicationAction
   */
  async addUpdateApplicationAction(payload: any): Promise<ApiResponse<any>> {
    try {
      console.log('🎬 [USER-SERVICE] Adding/updating application action:', payload);
      
      const response = await axiosInterceptor.post('/Application/addUpdate_ApplicationAction', payload);
      
      console.log('✅ [USER-SERVICE] Application action response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error with application action:', error);
      throw error;
    }
  },

  /**
   * Save contractor application (Angular Save & Next Primary API)
   * Angular: ContractorLicence/addUpdateContractApplication_GeneralDetails
   */
  async saveContractorApplicationGeneralDetails(payload: any): Promise<ApiResponse<any>> {
    try {
      console.log('🏗️ [USER-SERVICE] Saving contractor application general details:', payload);
      
      const response = await axiosInterceptor.post('/ContractorLicence/addUpdateContractApplication_GeneralDetails', payload);
      
      console.log('✅ [USER-SERVICE] Contractor application general details response:', response);
      return response;
    } catch (error) {
      console.error('❌ [USER-SERVICE] Error saving contractor application general details:', error);
      throw error;
    }
  }
  
};