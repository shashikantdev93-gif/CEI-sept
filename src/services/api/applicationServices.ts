import type { AxiosResponse } from 'axios';
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

// =============================================================================
// ENHANCED API SERVICE INFRASTRUCTURE
// =============================================================================

// Enhanced API service configuration
export interface ApiServiceConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  enableLogging: boolean;
}

// Default configuration
const defaultConfig: ApiServiceConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  enableLogging: true,
};

// Enhanced error types
export interface ApiError extends Error {
  code?: string;
  status?: number;
  response?: AxiosResponse;
  isRetryable?: boolean;
  retryCount?: number;
}

// Request options
export interface RequestOptions {
  retries?: number;
  timeout?: number;
  skipLogging?: boolean;
  skipErrorHandling?: boolean;
  customHeaders?: Record<string, string>;
  transformRequest?: (data: any) => any;
}

// Response wrapper
export interface EnhancedApiResponse<T = any> {
  data: T;
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
  requestId?: string;
}

// Enhanced API Service class
class EnhancedApiService {
  private config: ApiServiceConfig;
  private requestCounter = 0;

  constructor(config: Partial<ApiServiceConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestCounter}`;
  }

  // Log API calls
  private log(level: 'info' | 'error' | 'warn', message: string, data?: any): void {
    if (!this.config.enableLogging) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [APPLICATION-SERVICE] ${message}`;

    switch (level) {
      case 'info':
        console.log(`✅ ${logMessage}`, data || '');
        break;
      case 'error':
        console.error(`❌ ${logMessage}`, data || '');
        break;
      case 'warn':
        console.warn(`⚠️ ${logMessage}`, data || '');
        break;
    }
  }

  // Check if error is retryable
  private isRetryableError(error: any): boolean {
    if (!error.response) {
      return true; // Network errors are retryable
    }

    const status = error.response.status;
    return status >= 500 || status === 429 || status === 408;
  }

  // Wait for retry delay
  private async waitForRetry(attempt: number): Promise<void> {
    const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Enhanced request method with retry logic
  private async makeRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<EnhancedApiResponse<T>> {
    const requestId = this.generateRequestId();
    const maxRetries = options.retries ?? this.config.maxRetries;
    let lastError: ApiError | undefined;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        if (!options.skipLogging) {
          this.log('info', `${method.toUpperCase()} ${url} (attempt ${attempt}/${maxRetries + 1})`, {
            requestId,
            data: method !== 'get' ? data : undefined,
          });
        }

        const config: any = {
          timeout: options.timeout ?? this.config.timeout,
          headers: options.customHeaders || {},
        };

        if (options.transformRequest) {
          config.transformRequest = [options.transformRequest];
        }

        let response: ApiResponse<any>;
        switch (method) {
          case 'get':
            response = await axiosInterceptor.get(url, config);
            break;
          case 'post':
            response = await axiosInterceptor.post(url, data, config);
            break;
          case 'put':
            response = await axiosInterceptor.put(url, data, config);
            break;
          case 'delete':
            response = await axiosInterceptor.delete(url, config);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        const enhancedResponse: EnhancedApiResponse<T> = {
          data: response.data,
          success: true,
          message: 'Request successful',
          status: response.status || 200,
          timestamp: new Date().toISOString(),
          requestId,
        };

        if (!options.skipLogging) {
          this.log('info', `${method.toUpperCase()} ${url} completed successfully`, {
            requestId,
            status: response.status,
          });
        }

        return enhancedResponse;

      } catch (error: any) {
        lastError = {
          ...error,
          code: error.code || 'UNKNOWN_ERROR',
          status: error.response?.status || 0,
          response: error.response,
          isRetryable: this.isRetryableError(error),
          retryCount: attempt - 1,
        };

        if (!options.skipLogging) {
          this.log('error', `${method.toUpperCase()} ${url} failed (attempt ${attempt}/${maxRetries + 1})`, {
            requestId,
            error: lastError?.message,
            status: lastError?.status,
            isRetryable: lastError?.isRetryable,
          });
        }

        if (attempt > maxRetries || !lastError?.isRetryable) {
          break;
        }

        await this.waitForRetry(attempt);
      }
    }

    if (!options.skipErrorHandling) {
      this.log('error', `${method.toUpperCase()} ${url} failed after ${maxRetries + 1} attempts`, lastError);
    }

    throw lastError || new Error('Request failed with unknown error');
  }

  async get<T>(url: string, options?: RequestOptions): Promise<EnhancedApiResponse<T>> {
    return this.makeRequest<T>('get', url, undefined, options);
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<EnhancedApiResponse<T>> {
    return this.makeRequest<T>('post', url, data, options);
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<EnhancedApiResponse<T>> {
    return this.makeRequest<T>('put', url, data, options);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<EnhancedApiResponse<T>> {
    return this.makeRequest<T>('delete', url, undefined, options);
  }

  async uploadFile(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
    options?: RequestOptions
  ): Promise<EnhancedApiResponse<any>> {
    const requestId = this.generateRequestId();

    try {
      this.log('info', `FILE UPLOAD ${url}`, { requestId });

      const response = await axiosInterceptor.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(options?.customHeaders || {}),
        },
        timeout: options?.timeout ?? this.config.timeout * 2,
        transformRequest: [(data) => data],
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      const enhancedResponse: EnhancedApiResponse<any> = {
        data: response.data,
        success: true,
        message: 'File upload successful',
        status: response.status || 200,
        timestamp: new Date().toISOString(),
        requestId,
      };

      this.log('info', `FILE UPLOAD ${url} completed successfully`, { requestId });
      return enhancedResponse;

    } catch (error: any) {
      this.log('error', `FILE UPLOAD ${url} failed`, { requestId, error: error.message });
      throw error;
    }
  }
}

// =============================================================================
// LEGACY INTERFACES & TYPES (for backward compatibility)
// =============================================================================

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
  customValidationResult?: {
    hasException: boolean;
    message: string;
  };
}

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
}

export interface SavedContractorData {
  contractorApplicationId: number;
  appRefId: number;
  applicant_name: string;
  address: string;
  panCardNumber: string;
  contractorType: number;
  currentWorkingVoltage: number;
  signeeNameOnBehalfOfCompany?: string;
  businessEntity?: string;
  businessEntityAddress?: string;
}

// =============================================================================
// UNIFIED APPLICATION SERVICES
// =============================================================================

// Create enhanced service instance
const enhancedApiService = new EnhancedApiService();

// Consolidated application services (combining original userDetailsService + enhancements)
export const applicationServices = {
  
  // =============================================================================
  // ENHANCED METHODS (New with retry logic and better error handling)
  // =============================================================================
  
  // Authentication & OTP
  async generateOTPEnhanced(payload: GenerateOTPPayload): Promise<ApiResponse<any>> {
    try {
      const response = await enhancedApiService.post('/OTP/generateOTP', payload);
      return response as ApiResponse<any>;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Enhanced OTP generation failed:', error);
      throw error;
    }
  },

  // File Upload with progress tracking
  async uploadFileEnhanced(
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<any>> {
    try {
      const response = await enhancedApiService.uploadFile('/UploadFile', formData, onProgress);
      return response as ApiResponse<any>;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Enhanced file upload failed:', error);
      throw error;
    }
  },

  // =============================================================================
  // ORIGINAL METHODS (Legacy compatibility - direct API calls)
  // =============================================================================
  
  // Authentication & OTP
  async generateOTP(payload: GenerateOTPPayload): Promise<ApiResponse<any>> {
    try {
      console.log('📱 [APPLICATION-SERVICE] Generating OTP for:', payload.mobileNumber);
      const response = await axiosInterceptor.post('/OTP/generateOTP', payload);
      console.log('✅ [APPLICATION-SERVICE] OTP generation response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error generating OTP:', error);
      throw error;
    }
  },

  async verifyOTP(payload: { mobileNumber: string; otpCode: string; userId: number }): Promise<ApiResponse<any>> {
    try {
      console.log('🔐 [APPLICATION-SERVICE] Verifying OTP for:', payload.mobileNumber);
      const response = await axiosInterceptor.post('/OTP/verifyOTP', payload);
      console.log('✅ [APPLICATION-SERVICE] OTP verification response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error verifying OTP:', error);
      throw error;
    }
  },

  // User & Profile Management
  async addUser(payload: UserDetailsPayload): Promise<ApiResponse<any>> {
    try {
      console.log('👤 [APPLICATION-SERVICE] Adding user:', payload);
      const response = await axiosInterceptor.post('/User/addUser', payload);
      console.log('✅ [APPLICATION-SERVICE] Add user response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error adding user:', error);
      throw error;
    }
  },

  async getProjectSiteDetails(projectSiteId: number): Promise<ApiResponse<ProjectSiteData>> {
    try {
      console.log('🏗️ [APPLICATION-SERVICE] Getting project site details for ID:', projectSiteId);
      const response = await axiosInterceptor.get(`/ProjectSite/getProjectSite_ById?id=${projectSiteId}`);
      console.log('✅ [APPLICATION-SERVICE] Project site details response:', response);
      return response as ApiResponse<ProjectSiteData>;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error getting project site details:', error);
      throw error;
    }
  },

  // Contractor Operations
  async saveContractorApplication(payload: ContractorApplicationPayload): Promise<ApiResponse<ContractorApplicationResponse>> {
    try {
      console.log('🏢 [APPLICATION-SERVICE] Saving contractor application:', payload);
      const response = await axiosInterceptor.post('/ContractorLicence/addUpdateContractApplication_GeneralDetails', payload);
      console.log('✅ [APPLICATION-SERVICE] Contractor application response:', response);
      return response as ApiResponse<ContractorApplicationResponse>;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error saving contractor application:', error);
      throw error;
    }
  },

  async saveContractorApplicationGeneralDetails(payload: any): Promise<ApiResponse<any>> {
    try {
      console.log('🏗️ [APPLICATION-SERVICE] Saving contractor application general details:', payload);
      const response = await axiosInterceptor.post('/ContractorLicence/addUpdateContractApplication_GeneralDetails', payload);
      console.log('✅ [APPLICATION-SERVICE] Contractor application general details response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error saving contractor application general details:', error);
      throw error;
    }
  },

  async getContractorApplication(id: number): Promise<ApiResponse<SavedContractorData>> {
    try {
      console.log('📋 [APPLICATION-SERVICE] Getting contractor application for ID:', id);
      const response = await axiosInterceptor.get(`/ContractorLicence/getContractorApplicationDetails_ById?id=${id}`);
      console.log('✅ [APPLICATION-SERVICE] Contractor application details:', response);
      return response as ApiResponse<SavedContractorData>;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error getting contractor application:', error);
      throw error;
    }
  },

  async getContractorApplicationDetails(applicationId: number): Promise<ApiResponse<any>> {
    try {
      console.log('📝 [APPLICATION-SERVICE] Getting contractor application details for ID:', applicationId);
      const response = await axiosInterceptor.get(`/ContractorLicence/getContractorApplicationDetails_ById?id=${applicationId}`);
      console.log('✅ [APPLICATION-SERVICE] Contractor application details response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error getting contractor application details:', error);
      throw error;
    }
  },

  // Working Areas
  async addWorkingArea(payload: WorkingAreaPayload): Promise<ApiResponse<WorkingAreaResponse>> {
    try {
      console.log('📍 [APPLICATION-SERVICE] Adding working area:', payload);
      const response = await axiosInterceptor.post('/ContractorLicence/addUpdateContract_WorkingArea', payload);
      console.log('✅ [APPLICATION-SERVICE] Working area response:', response);
      return response as ApiResponse<WorkingAreaResponse>;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error adding working area:', error);
      throw error;
    }
  },

  async updateWorkingArea(payload: WorkingAreaPayload): Promise<ApiResponse<WorkingAreaResponse>> {
    try {
      console.log('📍 [APPLICATION-SERVICE] Updating working area:', payload);
      const response = await axiosInterceptor.post('/ContractorLicence/addUpdateContract_WorkingArea', payload);
      console.log('✅ [APPLICATION-SERVICE] Working area update response:', response);
      return response as ApiResponse<WorkingAreaResponse>;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error updating working area:', error);
      throw error;
    }
  },

  async deleteWorkingArea(id: number): Promise<ApiResponse<any>> {
    try {
      console.log('📍 [APPLICATION-SERVICE] Deleting working area with ID:', id);
      const response = await axiosInterceptor.get(`/ContractorLicence/deleteContractWorkingTehsil_ById?workingTehsilId=${id}`);
      console.log('✅ [APPLICATION-SERVICE] Working area delete response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error deleting working area:', error);
      throw error;
    }
  },

  // Instruments
  async addInstrument(payload: InstrumentPayload): Promise<ApiResponse<InstrumentResponse>> {
    try {
      console.log('🔧 [APPLICATION-SERVICE] Adding instrument:', payload);
      const response = await axiosInterceptor.post('/ContractorLicence/addUpdateContract_InstrumentDetails', payload);
      console.log('✅ [APPLICATION-SERVICE] Instrument response:', response);
      return response as ApiResponse<InstrumentResponse>;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error adding instrument:', error);
      throw error;
    }
  },

  async updateInstrument(payload: InstrumentPayload): Promise<ApiResponse<InstrumentResponse>> {
    try {
      console.log('🔧 [APPLICATION-SERVICE] Updating instrument:', payload);
      const response = await axiosInterceptor.post('/ContractorLicence/addUpdateContract_InstrumentDetails', payload);
      console.log('✅ [APPLICATION-SERVICE] Instrument update response:', response);
      return response as ApiResponse<InstrumentResponse>;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error updating instrument:', error);
      throw error;
    }
  },

  async deleteInstrument(id: number): Promise<ApiResponse<any>> {
    try {
      console.log('🔧 [APPLICATION-SERVICE] Deleting instrument with ID:', id);
      const response = await axiosInterceptor.get(`/ContractorLicence/deleteContractInstrumentDetails_ById?instrumentId=${id}`);
      console.log('✅ [APPLICATION-SERVICE] Instrument delete response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error deleting instrument:', error);
      throw error;
    }
  },

  // Partners
  async addPartner(payload: PartnerPayload): Promise<ApiResponse<PartnerResponse>> {
    try {
      console.log('👥 [APPLICATION-SERVICE] Adding partner:', payload);
      const response = await axiosInterceptor.post('/ContractorLicence/addUpdateContract_PartnerDetails', payload);
      console.log('✅ [APPLICATION-SERVICE] Partner response:', response);
      return response as ApiResponse<PartnerResponse>;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error adding partner:', error);
      throw error;
    }
  },

  async updatePartner(payload: PartnerPayload): Promise<ApiResponse<PartnerResponse>> {
    try {
      console.log('👥 [APPLICATION-SERVICE] Updating partner:', payload);
      const response = await axiosInterceptor.post('/ContractorLicence/addUpdateContract_PartnerDetails', payload);
      console.log('✅ [APPLICATION-SERVICE] Partner update response:', response);
      return response as ApiResponse<PartnerResponse>;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error updating partner:', error);
      throw error;
    }
  },

  async deletePartner(id: number): Promise<ApiResponse<any>> {
    try {
      console.log('👥 [APPLICATION-SERVICE] Deleting partner with ID:', id);
      const response = await axiosInterceptor.get(`/ContractorLicence/deleteContractPartner_ById?partnershipId=${id}`);
      console.log('✅ [APPLICATION-SERVICE] Partner delete response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error deleting partner:', error);
      throw error;
    }
  },

  async checkPANExists(panNumber: string): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 [APPLICATION-SERVICE] Checking PAN exists:', panNumber);
      const response = await axiosInterceptor.get(`/ProjectSites/getProjectSitesPanDetails?panno=${panNumber.toUpperCase()}`);
      console.log('✅ [APPLICATION-SERVICE] PAN check response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error checking PAN:', error);
      throw error;
    }
  },

  // Supervisor & Wireman Operations
  async getSupervisorDetails_ByLicenceNo(licenceNo: string): Promise<ApiResponse<any>> {
    try {
      console.log('👨‍💼 [APPLICATION-SERVICE] Getting supervisor details by licence:', licenceNo);
      const response = await axiosInterceptor.get(`/ContractorLicence/getSupervisorDetails_ByLicenceNo?licenceNo=${licenceNo}`);
      console.log('✅ [APPLICATION-SERVICE] Supervisor details response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error getting supervisor details:', error);
      throw error;
    }
  },

  async getWiremanDetails_ByLicenceNo(licenceNo: string): Promise<ApiResponse<any>> {
    try {
      console.log('👷‍♂️ [APPLICATION-SERVICE] Getting wireman details by licence:', licenceNo);
      const response = await axiosInterceptor.get(`/WiremanLicence/getWiremanDetails_ByLicenceNo?licenceNo=${licenceNo}`);
      console.log('✅ [APPLICATION-SERVICE] Wireman details response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error getting wireman details:', error);
      throw error;
    }
  },

  async getSuperBacklogDetailsByLicenceNo(licenceNo: string): Promise<ApiResponse<any>> {
    try {
      console.log('📋 [APPLICATION-SERVICE] Getting supervisor backlog details:', licenceNo);
      const response = await axiosInterceptor.get(`/ContractorLicence/getSuperBacklogDetailsByLicenceNo?licenceNo=${licenceNo}`);
      console.log('✅ [APPLICATION-SERVICE] Supervisor backlog response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error getting supervisor backlog:', error);
      throw error;
    }
  },

  async getContractorWorkerDetails(appRefId: number): Promise<ApiResponse<any>> {
    try {
      console.log('👥 [APPLICATION-SERVICE] Getting contractor worker details:', appRefId);
      const response = await axiosInterceptor.get(`/ContractorLicence/getContractorWorkerDetails_ById?id=${appRefId}`);
      console.log('✅ [APPLICATION-SERVICE] Contractor worker details response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error getting contractor worker details:', error);
      throw error;
    }
  },

  async addUpdateContractSupervisor(payload: any): Promise<ApiResponse<any>> {
    try {
      console.log('👨‍💼 [APPLICATION-SERVICE] Adding/updating contract supervisor:', payload);
      const response = await axiosInterceptor.post('/ContractorLicence/addUpdateContractSupervisor_BacklogDetails', payload);
      console.log('✅ [APPLICATION-SERVICE] Contract supervisor response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error with contract supervisor:', error);
      throw error;
    }
  },

  async addUpdateContractWireman(payload: any): Promise<ApiResponse<any>> {
    try {
      console.log('👷‍♂️ [APPLICATION-SERVICE] Adding/updating contract wireman:', payload);
      const response = await axiosInterceptor.post('/ContractorLicence/addUpdateContractWireman_BacklogDetails', payload);
      console.log('✅ [APPLICATION-SERVICE] Contract wireman response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error with contract wireman:', error);
      throw error;
    }
  },

  async deleteContractSupervisor(id: number): Promise<ApiResponse<any>> {
    try {
      console.log('👨‍💼 [APPLICATION-SERVICE] Deleting contract supervisor:', id);
      const response = await axiosInterceptor.get(`/ContractorLicence/deleteContractSupervisorBacklog_ById?id=${id}`);
      console.log('✅ [APPLICATION-SERVICE] Supervisor delete response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error deleting supervisor:', error);
      throw error;
    }
  },

  async deleteContractWireman(id: number): Promise<ApiResponse<any>> {
    try {
      console.log('👷‍♂️ [APPLICATION-SERVICE] Deleting contract wireman:', id);
      const response = await axiosInterceptor.get(`/ContractorLicence/deleteContractWiremanBacklog_ById?id=${id}`);
      console.log('✅ [APPLICATION-SERVICE] Wireman delete response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error deleting wireman:', error);
      throw error;
    }
  },

  // Documents
  async getApplicationTypeAllowDoc(appRefId: number): Promise<ApiResponse<any>> {
    try {
      console.log('📄 [APPLICATION-SERVICE] Getting application type allowed documents:', appRefId);
      const response = await axiosInterceptor.get(`/CommonApis/getApplicationTypeAllowDoc?Id=${appRefId}&deleteTempFiles=false`);
      console.log('✅ [APPLICATION-SERVICE] Application type allowed documents response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error getting application type allowed documents:', error);
      throw error;
    }
  },

  async getContractorApplicationForDocuments_ById(id: number): Promise<ApiResponse<any>> {
    try {
      console.log('📄 [APPLICATION-SERVICE] Getting contractor application for documents:', id);
      const response = await axiosInterceptor.get(`/ContractorLicence/getContractorApplicationForDocuments_ById?id=${id}`);
      console.log('✅ [APPLICATION-SERVICE] Contractor application for documents response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error getting contractor application for documents:', error);
      throw error;
    }
  },

  // Application Actions
  async addUpdateApplicationDetails(payload: ApplicationDetailsPayload): Promise<ApiResponse<any>> {
    try {
      console.log('📋 [APPLICATION-SERVICE] Adding/updating application details:', payload);
      const response = await axiosInterceptor.post('/Application/addUpdate_ApplicationDetails', payload);
      console.log('✅ [APPLICATION-SERVICE] Application details response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error with application details:', error);
      throw error;
    }
  },

  async addUpdateApplicationAction(payload: ApplicationActionPayload): Promise<ApiResponse<ApplicationActionResponse>> {
    try {
      console.log('🎬 [APPLICATION-SERVICE] Adding/updating application action:', payload);
      const response = await axiosInterceptor.post('/Application/addUpdate_ApplicationAction', payload);
      console.log('✅ [APPLICATION-SERVICE] Application action response:', response);
      return response as ApiResponse<ApplicationActionResponse>;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error with application action:', error);
      throw error;
    }
  },

  // =============================================================================
  // COMPATIBILITY METHODS (Method alias for different naming conventions)
  // =============================================================================

  // Aliases for createApplicationDetails / createApplicationAction
  async createApplicationDetails(payload: ApplicationDetailsPayload): Promise<ApiResponse<any>> {
    return this.addUpdateApplicationDetails(payload);
  },

  async createApplicationAction(payload: ApplicationActionPayload): Promise<ApiResponse<ApplicationActionResponse>> {
    return this.addUpdateApplicationAction(payload);
  },

  // Alias for getContractorApplicationDetails
  async getContractorApplicationDetailsById(id: number): Promise<ApiResponse<any>> {
    return this.getContractorApplicationDetails(id);
  },

  // Working area aliases
  async createContractorWorkingArea(payload: WorkingAreaPayload): Promise<ApiResponse<WorkingAreaResponse>> {
    return this.addWorkingArea(payload);
  },

  async deleteContractorWorkingArea(id: number): Promise<ApiResponse<any>> {
    return this.deleteWorkingArea(id);
  },

  // Wire backlog method (if it exists in the original service)
  async getWireBacklogDetailsByLicenceNo(licenceNo: string): Promise<ApiResponse<any>> {
    try {
      console.log('📋 [APPLICATION-SERVICE] Getting wire backlog details:', licenceNo);
      const response = await axiosInterceptor.get(`/WiremanLicence/getWireBacklogDetailsByLicenceNo?licenceNo=${licenceNo}`);
      console.log('✅ [APPLICATION-SERVICE] Wire backlog response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error getting wire backlog:', error);
      throw error;
    }
  },

  // Instrument validation - Legacy endpoint compatibility
  async validateInstrumentSerialNumber(serialNumber: string): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 [APPLICATION-SERVICE] Validating instrument serial number:', serialNumber);
      const response = await axiosInterceptor.get(`/ContractorLicence/getContract_InstrumentDetails?instrumentSerialNo=${serialNumber}`);
      console.log('✅ [APPLICATION-SERVICE] Instrument validation response:', response);
      return response;
    } catch (error) {
      console.error('❌ [APPLICATION-SERVICE] Error validating instrument serial:', error);
      throw error;
    }
  }
};

// =============================================================================
// EXPORTS (Multiple export strategies for compatibility)
// =============================================================================

// Primary export - new consolidated service
export default applicationServices;

// Legacy compatibility exports
export const userDetailsService = applicationServices;
export const enhancedUserDetailsService = applicationServices;

// Enhanced API service for advanced usage
export { enhancedApiService as apiService };