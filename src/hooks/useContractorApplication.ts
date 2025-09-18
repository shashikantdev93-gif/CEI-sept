import { useState, useCallback, useEffect } from 'react';
import { applicationServices } from '../services/api/applicationServices';
import { ToastService } from '../utils/navigation';
import { ApplicationPayloadBuilder } from '../utils/applicationUtils';
import type { ContractorFormMode, ApplicationState } from '../types/contractor.types';

interface UseContractorApplicationReturn {
  applicationId: number | null;
  applicationState: ApplicationState | null;
  formMode: ContractorFormMode;
  isCreatingApplication: boolean;
  applicationError: string | null;
  setFormMode: (mode: ContractorFormMode) => void;
  createApplication: (formData: any) => Promise<number | null>;
  checkApplicationExists: () => boolean;
  persistApplicationState: (appData: ApplicationState) => void;
  restoreApplicationState: () => ApplicationState | null;
}

export const useContractorApplication = (): UseContractorApplicationReturn => {
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [applicationState, setApplicationState] = useState<ApplicationState | null>(null);
  const [formMode, setFormMode] = useState<ContractorFormMode>('new');
  const [isCreatingApplication, setIsCreatingApplication] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  // Persistence methods for application state
  const persistApplicationState = useCallback((appData: ApplicationState) => {
    console.log('💾 [USE-CONTRACTOR-APP] Persisting application state:', appData);
    try {
      sessionStorage.setItem('contractorApplicationState', JSON.stringify(appData));
      sessionStorage.setItem('contractorApplicationId', appData.appId?.toString() || '');
    } catch (error) {
      console.error('💾 [USE-CONTRACTOR-APP] Failed to persist application state:', error);
    }
  }, []);

  const restoreApplicationState = useCallback((): ApplicationState | null => {
    try {
      const savedState = sessionStorage.getItem('contractorApplicationState');
      const savedId = sessionStorage.getItem('contractorApplicationId');
      
      console.log('🔍 [USE-CONTRACTOR-APP] Attempting to restore state...');
      console.log('🔍 [USE-CONTRACTOR-APP] SavedState exists:', !!savedState);
      console.log('🔍 [USE-CONTRACTOR-APP] SavedId exists:', !!savedId);
      
      if (savedState && savedId) {
        const parsedState = JSON.parse(savedState);
        const parsedId = parseInt(savedId);
        
        console.log('💾 [USE-CONTRACTOR-APP] Restored application state:', parsedState);
        console.log('💾 [USE-CONTRACTOR-APP] Restored application ID:', parsedId);
        
        // IMMEDIATELY update React state
        setApplicationState(parsedState);
        setApplicationId(parsedId);
        
        return parsedState;
      } else {
        console.log('ℹ️ [USE-CONTRACTOR-APP] No saved state found in sessionStorage');
      }
    } catch (error) {
      console.error('💾 [USE-CONTRACTOR-APP] Failed to restore application state:', error);
    }
    return null;
  }, []);

  // Initialize from persisted state on mount
  useEffect(() => {
    const restored = restoreApplicationState();
    if (restored) {
      console.log('🔄 [USE-CONTRACTOR-APP] Initialized from persisted state');
    }
  }, [restoreApplicationState]);

  const checkApplicationExists = useCallback((): boolean => {
    return applicationId !== null && applicationId !== 0;
  }, [applicationId]);

  const createApplication = useCallback(async (formData: any): Promise<number | null> => {
    console.log('🚀 [USE-CONTRACTOR-APP] Creating application with form data:', formData);
    console.log('🚀 [USE-CONTRACTOR-APP] Form mode:', formMode);
    console.log('🚀 [USE-CONTRACTOR-APP] Existing application state:', applicationState);
    
    if (checkApplicationExists()) {
      console.log('✅ [USE-CONTRACTOR-APP] Application already exists:', applicationId);
      return applicationId;
    }

    setIsCreatingApplication(true);
    setApplicationError(null);

    try {
      // Create payload using the same logic as Angular
      const applicationPayload = ApplicationPayloadBuilder.createApplicationDetailsPayload(
        formMode,
        applicationState
      );

      const response = await applicationServices.createApplicationDetails(applicationPayload);

      if (response.success && response.data) {
        console.log('📥 [USE-CONTRACTOR-APP] Full response structure:', response);
        
        // Extract application ID (matches Angular response handling)
        const newApplicationId = response.data.applicationInitiateResponse?.appId ||
                                response.data.appId || 
                                response.data.applicationId || 
                                response.data.id ||
                                response.data.data?.appId ||
                                response.data.data?.applicationId;

        if (newApplicationId) {
          setApplicationId(newApplicationId);
          
          // Update application state for future iterations
          const newApplicationState = {
            appId: newApplicationId,
            iterationCount: applicationPayload.iterationCount,
            isLocked: applicationPayload.isLocked,
            isAllowEdit: applicationPayload.isAllowEdit,
            applicationLifeCycleStatusType: applicationPayload.applicationLifeCycleStatusType
          };
          
          setApplicationState(newApplicationState);
          
          // Persist the application state (critical for refresh)
          persistApplicationState(newApplicationState);
          
          console.log('✅ [USE-CONTRACTOR-APP] Application created successfully with ID:', newApplicationId);

          // Create ApplicationAction (matches Angular flow)
          try {
            console.log('🚀 [USE-CONTRACTOR-APP] Creating ApplicationAction');
            const applicationActionPayload = ApplicationPayloadBuilder.createApplicationActionPayload(
              newApplicationId,
              newApplicationState
            );
            
            await applicationServices.createApplicationAction(applicationActionPayload);
            console.log('✅ [USE-CONTRACTOR-APP] ApplicationAction created successfully');
          } catch (actionError) {
            console.error('❌ [USE-CONTRACTOR-APP] ApplicationAction failed:', actionError);
            // Don't fail the whole process if ApplicationAction fails
          }

          ToastService.success('Application created successfully');
          return newApplicationId;
        } else {
          console.error('❌ [USE-CONTRACTOR-APP] No application ID found in response:', response.data);
          throw new Error('Failed to create application - no application ID returned');
        }
      } else {
        throw new Error(response.message || 'Failed to create application');
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
  }, [applicationId, applicationState, formMode, checkApplicationExists, persistApplicationState]);

  return {
    applicationId,
    applicationState,
    formMode,
    isCreatingApplication,
    applicationError,
    setFormMode,
    createApplication,
    checkApplicationExists,
    persistApplicationState,
    restoreApplicationState
  };
};
export default useContractorApplication;
