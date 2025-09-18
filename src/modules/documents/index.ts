/**
 * Documents Module - Main Export
 * 
 * Unified document upload functionality for all modules
 */

// Main components
export { default as DocumentUploadManager } from './components/DocumentUploadManager';

// Hooks
export { useDocumentUpload } from './hooks/useDocumentUpload';

// Services
export { documentUploadService } from './services/documentUploadService';

// Types and configurations
export type {
  DocumentItem,
  DocumentUploadConfig,
  DocumentUploadContextData,
  DocumentUploadState,
  DocumentValidationRule,
  UseDocumentUploadReturn
} from './types/DocumentTypes';

export {
  CONTRACTOR_DOCUMENTS_CONFIG,
  SUPERVISOR_DOCUMENTS_CONFIG,
  WIREMAN_DOCUMENTS_CONFIG,
  DEFAULT_DOCUMENT_VALIDATION_RULES
} from './types/DocumentTypes';