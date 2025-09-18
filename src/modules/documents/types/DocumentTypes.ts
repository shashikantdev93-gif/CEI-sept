/**
 * Document Upload Types
 * Unified types for all document upload functionality across modules
 */

export interface DocumentItem {
  id: number;
  sNo: number;
  documentName: string;
  formatMaxSize: string;
  uploadedFile: File | null;
  fileName: string;
  isRequired?: boolean;
  documentType?: string;
  validationRules?: DocumentValidationRule[];
}

export interface DocumentValidationRule {
  type: 'size' | 'format' | 'required';
  value: any;
  message: string;
}

export interface DocumentUploadConfig {
  moduleType: 'contractor' | 'supervisor' | 'wireman';
  documents: Omit<DocumentItem, 'uploadedFile' | 'fileName'>[];
  navigationSessionKey: string;
  submitEndpoint?: string;
  validationRules?: DocumentValidationRule[];
}

export interface DocumentUploadState {
  documents: DocumentItem[];
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  uploadProgress: Record<number, number>;
}

export interface DocumentUploadContextData {
  workingAreaList?: any[];
  formMode?: string;
  selectedWorkingAreaDistrictsList?: any[];
  appRefId?: number;
  contractorLicenceId?: number;
  applicationContractorType?: string;
  applicationIsLocked?: boolean;
  renewAppId?: number;
  is30DaysCrossed?: boolean;
  supervisorId?: number;
  wiremanId?: number;
}

export interface UseDocumentUploadReturn {
  // State
  documents: DocumentItem[];
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  uploadProgress: Record<number, number>;
  
  // Context
  applicationContext: DocumentUploadContextData | null;
  
  // Actions
  handleDocumentUpload: (documentId: number, file: File) => void;
  handleDocumentRemove: (documentId: number) => void;
  handleSubmit: () => Promise<void>;
  clearError: () => void;
  
  // Validation
  validateDocuments: () => boolean;
  getValidationErrors: () => string[];
}

// Predefined document configurations for each module
export const CONTRACTOR_DOCUMENTS_CONFIG: DocumentUploadConfig = {
  moduleType: 'contractor',
  navigationSessionKey: 'allowContractorDocumentsNavigation',
  documents: [
    {
      id: 1,
      sNo: 1,
      documentName: 'PAN Card',
      formatMaxSize: 'PDF / 5MB',
      isRequired: true,
      documentType: 'pan'
    },
    {
      id: 2,
      sNo: 2,
      documentName: 'Aadhaar Card',
      formatMaxSize: 'PDF / 5MB',
      isRequired: true,
      documentType: 'aadhaar'
    },
    {
      id: 3,
      sNo: 3,
      documentName: 'Certificate of Incorporation',
      formatMaxSize: 'PDF / 5MB',
      isRequired: true,
      documentType: 'incorporation'
    },
    {
      id: 4,
      sNo: 4,
      documentName: 'Trade License',
      formatMaxSize: 'PDF / 5MB',
      isRequired: true,
      documentType: 'trade_license'
    },
    {
      id: 5,
      sNo: 5,
      documentName: 'GST Registration',
      formatMaxSize: 'PDF / 5MB',
      isRequired: false,
      documentType: 'gst'
    }
  ]
};

export const SUPERVISOR_DOCUMENTS_CONFIG: DocumentUploadConfig = {
  moduleType: 'supervisor',
  navigationSessionKey: 'allowUploadSupervisorDocumentNavigation',
  documents: [
    {
      id: 1,
      sNo: 1,
      documentName: 'PAN Card',
      formatMaxSize: 'PDF / 5MB',
      isRequired: true,
      documentType: 'pan'
    },
    {
      id: 2,
      sNo: 2,
      documentName: 'Aadhaar Card',
      formatMaxSize: 'PDF / 5MB',
      isRequired: true,
      documentType: 'aadhaar'
    },
    {
      id: 3,
      sNo: 3,
      documentName: 'Birth Certificate',
      formatMaxSize: 'PDF / 5MB',
      isRequired: true,
      documentType: 'birth_certificate'
    },
    {
      id: 4,
      sNo: 4,
      documentName: 'Educational Certificate',
      formatMaxSize: 'PDF / 5MB',
      isRequired: true,
      documentType: 'education'
    },
    {
      id: 5,
      sNo: 5,
      documentName: 'Experience Certificate',
      formatMaxSize: 'PDF / 5MB',
      isRequired: false,
      documentType: 'experience'
    }
  ]
};

export const WIREMAN_DOCUMENTS_CONFIG: DocumentUploadConfig = {
  moduleType: 'wireman',
  navigationSessionKey: 'allowUploadWiremanDocumentNavigation',
  documents: [
    {
      id: 1,
      sNo: 1,
      documentName: 'PAN Card',
      formatMaxSize: 'PDF / 5MB',
      isRequired: true,
      documentType: 'pan'
    },
    {
      id: 2,
      sNo: 2,
      documentName: 'Aadhaar Card',
      formatMaxSize: 'PDF / 5MB',
      isRequired: true,
      documentType: 'aadhaar'
    },
    {
      id: 3,
      sNo: 3,
      documentName: 'Birth Certificate',
      formatMaxSize: 'PDF / 5MB',
      isRequired: true,
      documentType: 'birth_certificate'
    },
    {
      id: 4,
      sNo: 4,
      documentName: 'Educational Certificate',
      formatMaxSize: 'PDF / 5MB',
      isRequired: true,
      documentType: 'education'
    },
    {
      id: 5,
      sNo: 5,
      documentName: 'Training Certificate',
      formatMaxSize: 'PDF / 5MB',
      isRequired: false,
      documentType: 'training'
    }
  ]
};

export const DEFAULT_DOCUMENT_VALIDATION_RULES: DocumentValidationRule[] = [
  {
    type: 'size',
    value: 5 * 1024 * 1024, // 5MB
    message: 'File size should not exceed 5MB'
  },
  {
    type: 'format',
    value: ['pdf', 'jpg', 'jpeg', 'png'],
    message: 'Only PDF, JPG, JPEG, PNG files are allowed'
  }
];