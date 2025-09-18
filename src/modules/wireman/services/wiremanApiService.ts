/**
 * Wireman API Service
 * Phase 2.4 - Modular Architecture
 * 
 * Handles all API interactions for wireman information form
 */

import type { WiremanApiResponse, WiremanFormData } from '../types/WiremanTypes';

export class WiremanApiService {
  
  /**
   * Saves wireman information to API
   */
  static async saveWiremanInformation(formData: WiremanFormData): Promise<WiremanApiResponse> {
    try {
      // TODO: Implement actual API call when endpoint is available
      // For now, return success to maintain existing functionality
      
      console.log('📤 [WIREMAN-API] Saving wireman information:', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        data: {
          message: 'Wireman information saved successfully',
          applicationId: Math.floor(Math.random() * 10000) + 1000
        }
      };
      
    } catch (error) {
      console.error('❌ [WIREMAN-API] Error saving wireman information:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Updates wireman information (for draft mode)
   */
  static async updateWiremanInformation(
    applicationId: number, 
    formData: WiremanFormData
  ): Promise<WiremanApiResponse> {
    try {
      console.log('📝 [WIREMAN-API] Updating wireman information for application:', applicationId);
      console.log('📝 [WIREMAN-API] Updated data:', formData);
      
      // TODO: Implement actual update API call
      // For now, return success to maintain existing functionality
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        data: {
          message: 'Wireman information updated successfully',
          applicationId
        }
      };
      
    } catch (error) {
      console.error('❌ [WIREMAN-API] Error updating wireman information:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Loads project site data (delegated to existing useProjectSiteAPI hook)
   * This service method is a wrapper for consistency, but the actual implementation
   * uses the existing useProjectSiteAPI hook in the business logic
   */
  static async loadProjectSiteData(): Promise<WiremanApiResponse> {
    try {
      console.log('🔄 [WIREMAN-API] Loading project site data...');
      
      // NOTE: This is handled by useProjectSiteAPI hook in the business logic
      // This method exists for API consistency but delegates to the hook
      
      return {
        success: true,
        data: {
          message: 'Project site data loading delegated to useProjectSiteAPI hook'
        }
      };
      
    } catch (error) {
      console.error('❌ [WIREMAN-API] Error in project site data loading:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Validates wireman form data
   */
  static validateWiremanForm(formData: WiremanFormData): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    
    // Required field validations
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.fatherName.trim()) {
      errors.fatherName = "Father's name is required";
    }
    
    if (!formData.panNo.trim()) {
      errors.panNo = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo)) {
      errors.panNo = 'Please enter a valid PAN number';
    }
    
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  /**
   * Gets current session storage navigation state
   */
  static getNavigationState(): Record<string, string | null> {
    return {
      allowWiremanInformationNavigation: sessionStorage.getItem('allowWiremanInformationNavigation'),
      allowUploadWiremanDocumentNavigation: sessionStorage.getItem('allowUploadWiremanDocumentNavigation'),
      allowDraftNavigation: sessionStorage.getItem('allowDraftNavigation'),
      draftApplicationData: sessionStorage.getItem('draftApplicationData'),
      ApplicationId: localStorage.getItem('ApplicationId'),
      InspectionType: localStorage.getItem('InspectionType')
    };
  }
  
  /**
   * Cleans up session storage navigation flags
   */
  static cleanupNavigationState(): void {
    console.log('🧹 [WIREMAN-API] Cleaning up navigation state...');
    
    sessionStorage.removeItem('allowWiremanInformationNavigation');
    sessionStorage.removeItem('allowDraftNavigation');
    sessionStorage.removeItem('draftApplicationData');
  }
  
  /**
   * Sets navigation flag for next step
   */
  static setUploadDocumentNavigationFlag(): void {
    console.log('🚀 [WIREMAN-API] Setting upload document navigation flag...');
    sessionStorage.setItem('allowUploadWiremanDocumentNavigation', 'true');
  }
}

export default WiremanApiService;