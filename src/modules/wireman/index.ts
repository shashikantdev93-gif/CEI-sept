/**
 * Wireman Module Index
 * Phase 2.4 - Modular Architecture
 * 
 * Main export point for all wireman module components
 */

// Business Logic Hook
export { useWiremanBusinessLogic } from './hooks/useWiremanBusinessLogic';

// API Service
export { default as WiremanApiService } from './services/wiremanApiService';

// Types
export type {
  WiremanFormData,
  WiremanFormState,
  WiremanFormErrors,
  WiremanApplication,
  WiremanLicenceGeneralDetails,
  UserProfile,
  UserProfileMapping,
  ProjectSiteUsers,
  ProjectSiteData,
  DraftDetectionResult,
  WiremanNavigationState,
  WiremanApiResponse,
  UseWiremanBusinessLogicReturn
} from './types/WiremanTypes';