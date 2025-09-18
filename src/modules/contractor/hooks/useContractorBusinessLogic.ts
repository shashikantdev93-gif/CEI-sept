/**
 * Contractor Business Logic Hook - Phase 2 Refactoring
 * 
 * This hook consolidates all contractor business logic while maintaining
 * 100% API compatibility with the original ContractorApplicantDetails component.
 * 
 * CRITICAL: This is a pass-through hook that preserves exact interface.
 */

import { useContractorForm } from '../../../hooks/useContractorForm';
import { useContractorValidation } from '../../../hooks/useContractorValidation';
import { contractorApiService } from '../services/contractorApiService';

export const useContractorBusinessLogic = (draftApplicationId: number | null) => {
  // ✅ Pass through existing hooks with no interface changes
  const contractorFormHook = useContractorForm(draftApplicationId);
  const validationHook = useContractorValidation();

  // ✅ Enhanced business logic functions (Phase 2 additions)
  const handleSaveAndContinue = async () => {
    console.log('🔄 [CONTRACTOR-LOGIC] Save and continue functionality');
    try {
      if (contractorFormHook.applicationData) {
        await contractorApiService.saveAsDraft(contractorFormHook.applicationData);
        console.log('✅ [CONTRACTOR-LOGIC] Draft saved successfully');
      }
    } catch (error) {
      console.error('❌ [CONTRACTOR-LOGIC] Save failed:', error);
    }
  };

  const handleDraftSave = async () => {
    console.log('💾 [CONTRACTOR-LOGIC] Draft save functionality');  
    return handleSaveAndContinue();
  };

  const handleFormSubmission = async (submissionType: 'draft' | 'final') => {
    console.log('📤 [CONTRACTOR-LOGIC] Form submission:', submissionType);
    try {
      if (contractorFormHook.applicationData) {
        if (submissionType === 'draft') {
          await contractorApiService.saveAsDraft(contractorFormHook.applicationData);
        } else {
          await contractorApiService.submitApplication(contractorFormHook.applicationData);
        }
        console.log('✅ [CONTRACTOR-LOGIC] Submission successful');
      }
    } catch (error) {
      console.error('❌ [CONTRACTOR-LOGIC] Submission failed:', error);
      throw error;
    }
  };

  // ✅ Return all original data plus enhanced business logic
  return {
    // Pass through ALL original hook data with exact same names
    ...contractorFormHook,
    ...validationHook,
    
    // Enhanced business logic functions (optional usage)
    handleSaveAndContinue,
    handleDraftSave,
    handleFormSubmission,
    
    // Form mode helpers
    formMode: draftApplicationId ? 'edit' : 'create',
    isEditMode: Boolean(draftApplicationId),
    isCreateMode: !draftApplicationId
  };
};

// ✅ Export with same name pattern as existing hooks
export default useContractorBusinessLogic;