/**
 * User Details Module Exports
 * Phase 2.3 - Modular Architecture
 * 
 * Centralized exports for the user details module
 */

// Hooks
export { useUserDetailsBusinessLogic } from './hooks/useUserDetailsBusinessLogic';

// Services
export { UserDetailsApiService } from './services/userDetailsApiService';

// Types
export type {
  UserDetailsFormData,
  UserDetailsFormState,
  UserDetailsFormErrors,
  UserDetailsPayload,
  UserDetailsApiResponse,
  OTPGenerationPayload,
  OTPResponse,
  FileUploadInfo,
  UserToken,
  UseUserDetailsBusinessLogicReturn
} from './types/UserDetailsTypes';
