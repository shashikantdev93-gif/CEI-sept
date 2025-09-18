/**
 * Document Upload Service
 * Unified service for all document upload operations across modules
 */

import { applicationServices } from '../../../services/api/applicationServices';
import encryptionService from '../../../lib/encryptionService';
import type { 
  DocumentItem, 
  DocumentUploadContextData, 
  DocumentValidationRule
} from '../types/DocumentTypes';

class DocumentUploadService {
  /**
   * Parse query parameters for document context
   */
  parseDocumentContext(searchParams: URLSearchParams): DocumentUploadContextData | null {
    try {
      const context: DocumentUploadContextData = {};
      
      // Decrypt and parse query parameters (Angular compatibility)
      const encryptedAppRefId = searchParams.get('appRefId');
      const encryptedFormMode = searchParams.get('formMode');
      const encryptedApplicationContractorType = searchParams.get('applicationContractorType');
      const encryptedIsFormLocked = searchParams.get('isFormLocked');
      const encryptedContractorLicenceId = searchParams.get('contractorLicenceId');
      const encryptedSupervisorId = searchParams.get('supervisorId');
      const encryptedWiremanId = searchParams.get('wiremanId');
      
      if (encryptedAppRefId) {
        context.appRefId = parseInt(encryptionService.decrypt(encryptedAppRefId), 10);
      }
      
      if (encryptedFormMode) {
        context.formMode = encryptionService.decrypt(encryptedFormMode);
      }
      
      if (encryptedApplicationContractorType) {
        context.applicationContractorType = encryptionService.decrypt(encryptedApplicationContractorType);
      }
      
      if (encryptedIsFormLocked) {
        context.applicationIsLocked = encryptionService.decrypt(encryptedIsFormLocked) === 'true';
      }
      
      if (encryptedContractorLicenceId) {
        context.contractorLicenceId = parseInt(encryptionService.decrypt(encryptedContractorLicenceId), 10);
      }
      
      if (encryptedSupervisorId) {
        context.supervisorId = parseInt(encryptionService.decrypt(encryptedSupervisorId), 10);
      }
      
      if (encryptedWiremanId) {
        context.wiremanId = parseInt(encryptionService.decrypt(encryptedWiremanId), 10);
      }
      
      console.log('📄 [DOCUMENT-SERVICE] Parsed context:', context);
      return context;
    } catch (error) {
      console.error('❌ [DOCUMENT-SERVICE] Failed to parse context:', error);
      return null;
    }
  }

  /**
   * Validate a document file
   */
  validateDocument(
    file: File, 
    _documentItem: DocumentItem, 
    customRules?: DocumentValidationRule[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const rules = customRules || [];
    
    // Check file size (default 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errors.push(`File size should not exceed 5MB`);
    }
    
    // Check file format
    const allowedFormats = ['pdf', 'jpg', 'jpeg', 'png'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      errors.push('Only PDF, JPG, JPEG, PNG files are allowed');
    }
    
    // Apply custom validation rules
    rules.forEach(rule => {
      switch (rule.type) {
        case 'size':
          if (file.size > rule.value) {
            errors.push(rule.message);
          }
          break;
        case 'format':
          const extension = file.name.split('.').pop()?.toLowerCase();
          if (!extension || !rule.value.includes(extension)) {
            errors.push(rule.message);
          }
          break;
        case 'required':
          if (rule.value && !file) {
            errors.push(rule.message);
          }
          break;
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate all documents in a collection
   */
  validateAllDocuments(documents: DocumentItem[]): { isValid: boolean; errors: string[] } {
    const allErrors: string[] = [];
    
    documents.forEach(doc => {
      if (doc.isRequired && !doc.uploadedFile) {
        allErrors.push(`${doc.documentName} is required`);
      }
      
      if (doc.uploadedFile) {
        const validation = this.validateDocument(doc.uploadedFile, doc);
        if (!validation.isValid) {
          allErrors.push(`${doc.documentName}: ${validation.errors.join(', ')}`);
        }
      }
    });
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }

  /**
   * Upload document for contractor
   */
  async uploadContractorDocument(
    documentId: number,
    file: File,
    context: DocumentUploadContextData
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('📤 [DOCUMENT-SERVICE] Uploading contractor document:', { documentId, fileName: file.name });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', `contractor_doc_${documentId}`);
      
      if (context.appRefId) {
        formData.append('appRefId', context.appRefId.toString());
      }
      
      if (context.contractorLicenceId) {
        formData.append('contractorLicenceId', context.contractorLicenceId.toString());
      }
      
      // Use existing applicationServices for consistency
      const response = await applicationServices.uploadFileEnhanced(formData);
      
      console.log('✅ [DOCUMENT-SERVICE] Contractor document uploaded successfully');
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ [DOCUMENT-SERVICE] Failed to upload contractor document:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  }

  /**
   * Upload document for supervisor
   */
  async uploadSupervisorDocument(
    documentId: number,
    file: File,
    context: DocumentUploadContextData
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('📤 [DOCUMENT-SERVICE] Uploading supervisor document:', { documentId, fileName: file.name });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', `supervisor_doc_${documentId}`);
      
      if (context.supervisorId) {
        formData.append('supervisorId', context.supervisorId.toString());
      }
      
      const response = await applicationServices.uploadFileEnhanced(formData);
      
      console.log('✅ [DOCUMENT-SERVICE] Supervisor document uploaded successfully');
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ [DOCUMENT-SERVICE] Failed to upload supervisor document:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  }

  /**
   * Upload document for wireman
   */
  async uploadWiremanDocument(
    documentId: number,
    file: File,
    context: DocumentUploadContextData
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('📤 [DOCUMENT-SERVICE] Uploading wireman document:', { documentId, fileName: file.name });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', `wireman_doc_${documentId}`);
      
      if (context.wiremanId) {
        formData.append('wiremanId', context.wiremanId.toString());
      }
      
      const response = await applicationServices.uploadFileEnhanced(formData);
      
      console.log('✅ [DOCUMENT-SERVICE] Wireman document uploaded successfully');
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ [DOCUMENT-SERVICE] Failed to upload wireman document:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  }

  /**
   * Submit all documents for final processing
   */
  async submitDocuments(
    moduleType: 'contractor' | 'supervisor' | 'wireman',
    documents: DocumentItem[],
    context: DocumentUploadContextData
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`📋 [DOCUMENT-SERVICE] Submitting ${moduleType} documents for final processing`);
      
      const payload = {
        moduleType,
        documents: documents.map(doc => ({
          id: doc.id,
          documentName: doc.documentName,
          documentType: doc.documentType,
          fileName: doc.fileName,
          isUploaded: !!doc.uploadedFile
        })),
        context
      };
      
      // For now, we'll use a placeholder endpoint - this should be implemented based on actual backend API
      const response = await applicationServices.addUser(payload as any);
      
      console.log(`✅ [DOCUMENT-SERVICE] ${moduleType} documents submitted successfully`);
      return { success: true, data: response };
    } catch (error) {
      console.error(`❌ [DOCUMENT-SERVICE] Failed to submit ${moduleType} documents:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Submission failed' };
    }
  }

  /**
   * Load existing documents for a module
   */
  async loadExistingDocuments(
    moduleType: 'contractor' | 'supervisor' | 'wireman',
    _context: DocumentUploadContextData
  ): Promise<{ success: boolean; documents?: DocumentItem[]; error?: string }> {
    try {
      console.log(`📋 [DOCUMENT-SERVICE] Loading existing ${moduleType} documents`);
      
      // For now, return empty documents - this should be implemented based on actual backend API
      // TODO: Implement actual API calls based on moduleType and context
      const response = { data: [] };
      
      console.log(`✅ [DOCUMENT-SERVICE] Loaded ${moduleType} documents successfully`);
      return { success: true, documents: response.data || [] };
    } catch (error) {
      console.error(`❌ [DOCUMENT-SERVICE] Failed to load ${moduleType} documents:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to load documents' };
    }
  }
}

export const documentUploadService = new DocumentUploadService();