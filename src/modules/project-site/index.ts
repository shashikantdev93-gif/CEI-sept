/**
 * Project Site Module Entry Point
 * Phase 2.5 - Modular Architecture
 * 
 * Main export file for the project site module
 */

// Types
export * from './types/ProjectSiteTypes';

// Services  
export { default as projectSiteApiService } from './services/projectSiteApiService';

// Hooks
export { useProjectSiteBusinessLogic } from './hooks/useProjectSiteBusinessLogic';

// Default export for convenience
export { useProjectSiteBusinessLogic as default } from './hooks/useProjectSiteBusinessLogic';