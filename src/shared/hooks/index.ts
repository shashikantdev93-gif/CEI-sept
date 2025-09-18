/**
 * Shared Hooks Export Index
 * Phase 2 - Modular Architecture
 * 
 * This file exports all shared hooks that can be used across
 * contractor, supervisor, and wireman modules.
 */

// Phase 1 Foundation Hooks (Ready for Phase 2)
export { useEnhancedFormValidation } from '../../hooks/useEnhancedFormValidation';
export { useDraftDetection } from '../../hooks/useDraftDetection';
export { useFormValidation } from '../../hooks/useFormValidation';

// Location & Geography  
export { useLocation } from '../../hooks/useLocation';

// Working Area Logic
export { useWorkingAreaLogic } from '../../hooks/useWorkingAreaLogic';

// Existing Contractor Hook (to be enhanced in Phase 2)
export { useContractorForm } from '../../hooks/useContractorForm';

// Phase 2 Shared State Management Hooks (NEW)
export { useAsyncState } from './useAsyncState';
export { useErrorHandler } from './useErrorHandler';
export { useModalState } from './useModalState';
export { useAsyncModal } from './useAsyncModal';

/**
 * Phase 2 Integration Notes:
 * 
 * Key hooks for module refactoring:
 * - useEnhancedFormValidation: Universal form validation
 * - useDraftDetection: Save/continue functionality  
 * - useContractorForm: Template for other modules
 * - useAsyncState: Standardized async operations with loading/error states
 * - useErrorHandler: Centralized error handling and logging
 * - useModalState: Modal visibility and data management
 * 
 * Module-specific hooks to be created:
 * - useModernContractorForm (enhanced version)
 * - useSupervisorForm (new modular hook)
 * - useWiremanForm (new modular hook)
 */