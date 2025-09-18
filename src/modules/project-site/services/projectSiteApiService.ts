/**
 * Project Site API Service
 * Phase 2.5 - Modular Architecture
 * 
 * Handles all API communications for project site management
 */

import { axiosInterceptor } from '../../../lib/interceptor';
import encryptionService from '../../../lib/encryptionService';
import type {
  ProjectSiteFormData,
  ProjectSiteApiFormData,
  ProjectSiteApiResponse,
  PanValidationResponse,
  ProjectSiteService,
  ProjectSiteServiceConfig,
  TokenData,
  ClientData
} from '../types/ProjectSiteTypes';

class ProjectSiteApiService implements ProjectSiteService {
  private config: ProjectSiteServiceConfig;

  constructor(config: ProjectSiteServiceConfig = {}) {
    this.config = {
      baseURL: '/ProjectSites',
      timeout: 30000,
      ...config
    };
  }

  /**
   * Validate PAN number for duplicates
   */
  async validatePan(panNumber: string): Promise<PanValidationResponse> {
    try {
      console.log('🔍 [PROJECT-SITE-API] Validating PAN:', panNumber);
      
      const response = await axiosInterceptor.get<any>(
        `${this.config.baseURL}/getProjectSitesPanDetails?panno=${panNumber}`
      );
      
      console.log('🔍 [PROJECT-SITE-API] PAN validation response:', response);
      
      // Extract the actual response data
      return {
        success: response.success || false,
        data: response.data,
        error: response.error
      };
      
    } catch (error) {
      console.error('❌ [PROJECT-SITE-API] PAN validation error:', error);
      
      // If PAN check fails, we continue with submission (as per original logic)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PAN validation failed'
      };
    }
  }

  /**
   * Submit project site form data
   */
  async submitProjectSite(formData: ProjectSiteApiFormData): Promise<ProjectSiteApiResponse> {
    try {
      console.log('💾 [PROJECT-SITE-API] Starting project site submission');
      console.log('💾 [PROJECT-SITE-API] Form data:', formData);
      console.log('💾 [PROJECT-SITE-API] Timestamp:', new Date().toISOString());
      
      const response = await axiosInterceptor.post<any>(
        `${this.config.baseURL}/addUpdate_ProjectSites`,
        formData
      );
      
      console.log('✅ [PROJECT-SITE-API] Submission response:', response);
      
      // Extract the actual response data
      return {
        success: response.success || false,
        data: response.data,
        error: response.error,
        message: response.message
      };
      
    } catch (error) {
      console.error('❌ [PROJECT-SITE-API] Submission error:', error);
      
      // Enhanced error handling
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('❌ [PROJECT-SITE-API] Axios error response:', axiosError.response?.data);
        console.error('❌ [PROJECT-SITE-API] Axios error status:', axiosError.response?.status);
        console.error('❌ [PROJECT-SITE-API] Axios error headers:', axiosError.response?.headers);
        
        const errorMessage = axiosError.response?.data?.message || 
                            axiosError.response?.data?.error || 
                            axiosError.message || 
                            'Unknown error occurred';
        
        return {
          success: false,
          error: `Failed to save project site details: ${errorMessage}`
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get client IP address from localStorage
   */
  getClientIP(): string {
    try {
      const clientIdData = localStorage.getItem('clientId');
      if (clientIdData) {
        const parsed: ClientData = JSON.parse(clientIdData);
        return parsed.ip || '::1';
      }
    } catch (error) {
      console.log('📱 [PROJECT-SITE-API] Using default client IP, parse error:', error);
    }
    
    return '::1'; // Default IP
  }

  /**
   * Get and validate token data
   */
  private getTokenData(): { userRefId: number; projectSiteId: number } {
    const token = JSON.parse(localStorage.getItem('token') || '{}') as TokenData;
    
    if (!token.userId) {
      throw new Error('No userId found in token');
    }
    
    const userRefId = parseInt(encryptionService.get(token.userId));
    const projectSiteId = token.projectSiteId ? parseInt(encryptionService.get(token.projectSiteId)) : 0;
    
    console.log('🔑 [PROJECT-SITE-API] Decrypted userRefId:', userRefId);
    console.log('🔑 [PROJECT-SITE-API] Decrypted projectSiteId:', projectSiteId);
    
    if (isNaN(userRefId)) {
      throw new Error('Invalid userRefId in token');
    }
    
    return { userRefId, projectSiteId };
  }

  /**
   * Prepare form data for API submission
   */
  prepareFormData(
    formData: ProjectSiteFormData,
    userRefId?: number,
    projectSiteId?: number,
    clientIP?: string
  ): ProjectSiteApiFormData {
    // Get token data if not provided
    let finalUserRefId = userRefId;
    let finalProjectSiteId = projectSiteId;
    
    if (!finalUserRefId || !finalProjectSiteId) {
      const tokenData = this.getTokenData();
      finalUserRefId = finalUserRefId || tokenData.userRefId;
      finalProjectSiteId = finalProjectSiteId || tokenData.projectSiteId;
    }
    
    const finalClientIP = clientIP || this.getClientIP();
    
    // Convert form data to API format (PascalCase)
    const apiFormData: ProjectSiteApiFormData = {
      ProjectSiteApplicationType: parseInt(formData.projectSiteApplicationType),
      ApplicantPanNumber: formData.applicantPanNumber,
      ApplicantPanAttachment: formData.applicantPanAttachment,
      Address1: formData.address1,
      Address2: formData.address2 || '',
      VillageOrTown: formData.villageOrTown || '',
      PinCode: parseInt(formData.pinCode),
      State: parseInt(formData.state),
      DistrictRefId: parseInt(formData.district.toString()),
      TehsilRefId: parseInt(formData.tehsil),
      IsActive: true,
      IsDelete: false,
      CreatedOnDate: new Date().toISOString(),
      LastModifiedOnDate: new Date().toISOString(),
      UserRefId: finalUserRefId,
      ProjectSiteId: finalProjectSiteId,
      ClientIPAddress: finalClientIP
    };
    
    console.log('📦 [PROJECT-SITE-API] Prepared API form data:', apiFormData);
    return apiFormData;
  }

  /**
   * Update token with new project site ID
   */
  updateTokenWithProjectSiteId(response: ProjectSiteApiResponse): number | null {
    try {
      console.log('🔑 [PROJECT-SITE-API] Updating token with project site ID');
      console.log('🔑 [PROJECT-SITE-API] Response data structure:', response.data);
      
      // Extract projectSiteId from various possible response structures
      let newProjectSiteId: number | null = null;
      
      if (response.data?.applicationInitiateResponse?.projectSiteId) {
        newProjectSiteId = response.data.applicationInitiateResponse.projectSiteId;
      } else if (response.data?.projectSiteId) {
        newProjectSiteId = response.data.projectSiteId;
      } else if (response.data?.data?.projectSiteId) {
        newProjectSiteId = response.data.data.projectSiteId;
      } else if (response.data?.formModel?.projectSiteId) {
        newProjectSiteId = response.data.formModel.projectSiteId;
      }
      
      console.log('🔑 [PROJECT-SITE-API] Extracted projectSiteId:', newProjectSiteId);
      
      if (newProjectSiteId) {
        const token = JSON.parse(localStorage.getItem('token') || '{}') as TokenData;
        token.projectSiteId = encryptionService.set(newProjectSiteId.toString());
        localStorage.setItem('token', JSON.stringify(token));
        console.log('✅ [PROJECT-SITE-API] Token updated with projectSiteId:', newProjectSiteId);
      }
      
      return newProjectSiteId;
      
    } catch (error) {
      console.error('❌ [PROJECT-SITE-API] Error updating token:', error);
      return null;
    }
  }

  /**
   * Validate form data before submission
   */
  validateFormData(formData: ProjectSiteFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required fields
    if (!formData.projectSiteApplicationType.trim()) {
      errors.push('Application Type is required');
    }
    
    if (!formData.applicantPanNumber.trim()) {
      errors.push('PAN Number is required');
    }
    
    if (!formData.applicantPanAttachment.trim()) {
      errors.push('PAN Attachment is required');
    }
    
    if (!formData.address1.trim()) {
      errors.push('Address Line 1 is required');
    }
    
    if (!formData.state) {
      errors.push('State is required');
    }
    
    if (!formData.district) {
      errors.push('District is required');
    }
    
    if (!formData.tehsil) {
      errors.push('Tehsil is required');
    }
    
    if (!formData.pinCode.trim()) {
      errors.push('Pincode is required');
    }
    
    // PAN format validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (formData.applicantPanNumber && !panRegex.test(formData.applicantPanNumber)) {
      errors.push('Invalid PAN format (e.g., ABCDE1234F)');
    }
    
    // Pincode length validation
    if (formData.pinCode && formData.pinCode.length !== 6) {
      errors.push('Pincode must be exactly 6 digits');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Complete project site submission workflow
   */
  async completeSubmission(formData: ProjectSiteFormData): Promise<{
    success: boolean;
    projectSiteId?: number;
    error?: string;
  }> {
    try {
      // Step 1: Validate form data
      const validation = this.validateFormData(formData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Step 2: Check for duplicate PAN
      const panValidation = await this.validatePan(formData.applicantPanNumber);
      if (panValidation.success && panValidation.data?.formModel !== null) {
        return {
          success: false,
          error: 'PAN Number already exists, please try different PAN Number'
        };
      }

      // Step 3: Prepare and submit form data
      const apiFormData = this.prepareFormData(formData);
      const response = await this.submitProjectSite(apiFormData);

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Failed to save project site'
        };
      }

      // Step 4: Update token with new project site ID
      const projectSiteId = this.updateTokenWithProjectSiteId(response);

      return {
        success: true,
        projectSiteId: projectSiteId || undefined
      };

    } catch (error) {
      console.error('❌ [PROJECT-SITE-API] Complete submission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Export singleton instance
const projectSiteApiService = new ProjectSiteApiService();
export default projectSiteApiService;