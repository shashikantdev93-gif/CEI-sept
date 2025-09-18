/**
 * Shared Services Export Index
 * Phase 2 - Modular Architecture
 * 
 * This file exports all shared services that can be used across
 * contractor, supervisor, and wireman modules.
 */

// Phase 1 Enhanced Services (Ready for Phase 2) 
export * from '../../services/api/applicationServices';

// Additional services that will be shared across modules
// TODO: Add enhanced user details service, file upload service, etc.

/**
 * Key Services for Phase 2:
 * 
 * - applicationServices: Unified API endpoints (Phase 1 complete)
 * - axiosInterceptor: Enhanced request/response handling
 * 
 * Services to be added:
 * - Enhanced file upload service
 * - Draft management service  
 * - Validation service integration
 */