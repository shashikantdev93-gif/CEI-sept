import { useState, useCallback } from 'react';
import { userDetailsService } from '../services/api/userDetailsService';
import type { ContractorApplicationPayload } from '../types/contractor.types'; // Remove unused import
import { ToastService } from '../utils/navigation';

interface UseContractorApplicationReturn {
  applicationId: number | null;
  isCreatingApplication: boolean;
  applicationError: string | null;
  createApplication: (formData: any) => Promise<number | null>;
  checkApplicationExists: () => boolean;
}

export const useContractorApplication = (): UseContractorApplicationReturn => {
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [isCreatingApplication, setIsCreatingApplication] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  const checkApplicationExists = useCallback((): boolean => {
    return applicationId !== null && applicationId !== 0;
  }, [applicationId]);

  const createApplication = useCallback(async (formData: any): Promise<number | null> => {
    console.log('🚀 [USE-CONTRACTOR-APP] Creating application with form data:', formData);
    
    // If application already exists, return existing ID
    if (checkApplicationExists()) {
      console.log('✅ [USE-CONTRACTOR-APP] Application already exists:', applicationId);
      return applicationId;
    }

    setIsCreatingApplication(true);
    setApplicationError(null);

    try {
      // Create payload matching Angular structure
      const payload: ContractorApplicationPayload = {
        contractorApplicationId: 0, // Always 0 for new applications
        appRefId: applicationId, // Will be null for new applications
        applicant_name: formData.applicant_name || '',
        address: formData.address || '',
        panCardNumber: formData.panCardNumber || '',
        contractorType: parseInt(formData.contractorType) || 0,
        currentWorkingVoltage: parseInt(formData.currentWorkingVoltage) || 0,
        signeeNameOnBehalfOfCompany: formData.signeeNameOnBehalfOfCompany || '',
        businessEntity: formData.businessEntity || '',
        businessEntityAddress: formData.businessEntityAddress || '',
        createdOnDate: new Date().toISOString(),
        lastModifiedOnDate: new Date().toISOString()
      };

      console.log('📦 [USE-CONTRACTOR-APP] Sending payload:', payload);

      const response = await userDetailsService.createContractorApplication(payload);

      // Fix: Use correct response structure based on your API
      if (response.success && response.data?.data?.appRefId) {
        const newApplicationId = response.data.data.appRefId;
        setApplicationId(newApplicationId);
        
        console.log('✅ [USE-CONTRACTOR-APP] Application created successfully with ID:', newApplicationId);
        ToastService.success('Application created successfully');
        
        return newApplicationId;
      } else {
        throw new Error('Failed to create application - no application ID returned');
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create application';
      setApplicationError(errorMessage);
      
      console.error('❌ [USE-CONTRACTOR-APP] Error creating application:', error);
      ToastService.error(errorMessage);
      
      return null;
    } finally {
      setIsCreatingApplication(false);
    }
  }, [applicationId, checkApplicationExists]);

  return {
    applicationId,
    isCreatingApplication,
    applicationError,
    createApplication,
    checkApplicationExists
  };
};
export default useContractorApplication;