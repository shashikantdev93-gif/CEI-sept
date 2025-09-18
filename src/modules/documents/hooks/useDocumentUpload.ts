/**
 * Document Upload Hook
 * Unified business logic for document upload across all modules
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation as useRouterLocation } from 'react-router-dom';
import type { 
  UseDocumentUploadReturn, 
  DocumentUploadConfig, 
  DocumentUploadContextData, 
  DocumentUploadState 
} from '../types/DocumentTypes';
import { documentUploadService } from '../services/documentUploadService';

export const useDocumentUpload = (config: DocumentUploadConfig): UseDocumentUploadReturn => {
  const location = useRouterLocation();
  
  // State management
  const [state, setState] = useState<DocumentUploadState>({
    documents: config.documents.map(doc => ({
      ...doc,
      uploadedFile: null,
      fileName: ''
    })),
    isLoading: false,
    error: null,
    isSubmitting: false,
    uploadProgress: {}
  });
  
  const [applicationContext, setApplicationContext] = useState<DocumentUploadContextData | null>(null);

  // Parse application context from URL parameters
  useEffect(() => {
    console.log(`🔄 [DOCUMENT-HOOK-${config.moduleType.toUpperCase()}] Processing query parameters`);
    
    const urlParams = new URLSearchParams(location.search);
    const context = documentUploadService.parseDocumentContext(urlParams);
    setApplicationContext(context);
    
    console.log(`✅ [DOCUMENT-HOOK-${config.moduleType.toUpperCase()}] Context parsed:`, context);
  }, [location.search, config.moduleType]);

  // Navigation flag management
  useEffect(() => {
    console.log(`📍 [DOCUMENT-HOOK-${config.moduleType.toUpperCase()}] Setting navigation flags`);
    sessionStorage.setItem(config.navigationSessionKey, 'true');
    
    return () => {
      console.log(`📍 [DOCUMENT-HOOK-${config.moduleType.toUpperCase()}] Cleaning navigation flags`);
      sessionStorage.removeItem(config.navigationSessionKey);
    };
  }, [config.navigationSessionKey, config.moduleType]);

  // Load existing documents
  useEffect(() => {
    if (applicationContext) {
      loadExistingDocuments();
    }
  }, [applicationContext]);

  const loadExistingDocuments = useCallback(async () => {
    if (!applicationContext) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log(`📋 [DOCUMENT-HOOK-${config.moduleType.toUpperCase()}] Loading existing documents`);
      
      const result = await documentUploadService.loadExistingDocuments(
        config.moduleType,
        applicationContext
      );
      
      if (result.success && result.documents) {
        setState(prev => ({
          ...prev,
          documents: prev.documents.map(doc => {
            const existing = result.documents?.find(existingDoc => existingDoc.id === doc.id);
            return existing || doc;
          }),
          isLoading: false
        }));
        
        console.log(`✅ [DOCUMENT-HOOK-${config.moduleType.toUpperCase()}] Documents loaded successfully`);
      } else {
        throw new Error(result.error || 'Failed to load documents');
      }
    } catch (error) {
      console.error(`❌ [DOCUMENT-HOOK-${config.moduleType.toUpperCase()}] Error loading documents:`, error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load documents'
      }));
    }
  }, [applicationContext, config.moduleType]);

  const handleDocumentUpload = useCallback(async (documentId: number, file: File) => {
    if (!applicationContext) {
      setState(prev => ({ ...prev, error: 'Application context not available' }));
      return;
    }

    // Find the document
    const document = state.documents.find(doc => doc.id === documentId);
    if (!document) {
      setState(prev => ({ ...prev, error: 'Document not found' }));
      return;
    }

    // Validate the file
    const validation = documentUploadService.validateDocument(file, document, config.validationRules);
    if (!validation.isValid) {
      setState(prev => ({ ...prev, error: validation.errors.join(', ') }));
      return;
    }

    // Clear any previous errors
    setState(prev => ({ ...prev, error: null }));

    try {
      console.log(`📤 [DOCUMENT-HOOK-${config.moduleType.toUpperCase()}] Uploading document:`, document.documentName);
      
      // Set upload progress
      setState(prev => ({
        ...prev,
        uploadProgress: { ...prev.uploadProgress, [documentId]: 0 }
      }));

      let result;
      switch (config.moduleType) {
        case 'contractor':
          result = await documentUploadService.uploadContractorDocument(documentId, file, applicationContext);
          break;
        case 'supervisor':
          result = await documentUploadService.uploadSupervisorDocument(documentId, file, applicationContext);
          break;
        case 'wireman':
          result = await documentUploadService.uploadWiremanDocument(documentId, file, applicationContext);
          break;
        default:
          throw new Error(`Unsupported module type: ${config.moduleType}`);
      }

      if (result.success) {
        // Update document state
        setState(prev => ({
          ...prev,
          documents: prev.documents.map(doc => 
            doc.id === documentId 
              ? { ...doc, uploadedFile: file, fileName: file.name }
              : doc
          ),
          uploadProgress: { ...prev.uploadProgress, [documentId]: 100 }
        }));
        
        console.log(`✅ [DOCUMENT-HOOK-${config.moduleType.toUpperCase()}] Document uploaded successfully`);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error(`❌ [DOCUMENT-HOOK-${config.moduleType.toUpperCase()}] Upload error:`, error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Upload failed',
        uploadProgress: { ...prev.uploadProgress, [documentId]: 0 }
      }));
    }
  }, [state.documents, applicationContext, config.moduleType, config.validationRules]);

  const handleDocumentRemove = useCallback((documentId: number) => {
    console.log(`🗑️ [DOCUMENT-HOOK-${config.moduleType.toUpperCase()}] Removing document:`, documentId);
    
    setState(prev => ({
      ...prev,
      documents: prev.documents.map(doc => 
        doc.id === documentId 
          ? { ...doc, uploadedFile: null, fileName: '' }
          : doc
      ),
      uploadProgress: { ...prev.uploadProgress, [documentId]: 0 }
    }));
  }, [config.moduleType]);

  const validateDocuments = useCallback((): boolean => {
    const validation = documentUploadService.validateAllDocuments(state.documents);
    
    if (!validation.isValid) {
      setState(prev => ({ ...prev, error: validation.errors.join('; ') }));
      return false;
    }
    
    setState(prev => ({ ...prev, error: null }));
    return true;
  }, [state.documents]);

  const getValidationErrors = useCallback((): string[] => {
    const validation = documentUploadService.validateAllDocuments(state.documents);
    return validation.errors;
  }, [state.documents]);

  const handleSubmit = useCallback(async () => {
    if (!applicationContext) {
      setState(prev => ({ ...prev, error: 'Application context not available' }));
      return;
    }

    // Validate all documents
    if (!validateDocuments()) {
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      console.log(`📋 [DOCUMENT-HOOK-${config.moduleType.toUpperCase()}] Submitting documents`);
      
      const result = await documentUploadService.submitDocuments(
        config.moduleType,
        state.documents,
        applicationContext
      );

      if (result.success) {
        console.log(`✅ [DOCUMENT-HOOK-${config.moduleType.toUpperCase()}] Documents submitted successfully`);
        
        // Navigate to next step or show success message
        // This can be customized based on the module's navigation flow
        
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error(`❌ [DOCUMENT-HOOK-${config.moduleType.toUpperCase()}] Submission error:`, error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Submission failed'
      }));
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [applicationContext, state.documents, config.moduleType, validateDocuments]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    documents: state.documents,
    isLoading: state.isLoading,
    error: state.error,
    isSubmitting: state.isSubmitting,
    uploadProgress: state.uploadProgress,
    
    // Context
    applicationContext,
    
    // Actions
    handleDocumentUpload,
    handleDocumentRemove,
    handleSubmit,
    clearError,
    
    // Validation
    validateDocuments,
    getValidationErrors
  };
};