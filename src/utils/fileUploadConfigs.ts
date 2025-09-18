import type { FileUploadConfig } from '../components/shared-component/FileUpload';

// Document type configurations for different upload scenarios
export const documentUploadConfigs = {
  // Profile and signature images (contractor/supervisor forms)
  profilePhoto: {
    allowedTypes: ['image/jpeg', '.jpg'],
    maxSize: 1024 * 1024, // 1MB
    multiple: false,
    required: true,
    showPreview: true,
    showProgress: true,
  } as FileUploadConfig,

  signature: {
    allowedTypes: ['image/jpeg', '.jpg'],
    maxSize: 1024 * 1024, // 1MB
    multiple: false,
    required: true,
    showPreview: true,
    showProgress: true,
  } as FileUploadConfig,

  partnerPhoto: {
    allowedTypes: ['image/jpeg', '.jpg'],
    maxSize: 1024 * 1024, // 1MB
    multiple: false,
    required: false,
    showPreview: true,
    showProgress: true,
  } as FileUploadConfig,

  // Document uploads (PDF files for licenses, certificates, etc.)
  panCard: {
    allowedTypes: ['application/pdf', '.pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    required: true,
    showPreview: false,
    showProgress: true,
  } as FileUploadConfig,

  aadhaarCard: {
    allowedTypes: ['application/pdf', '.pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    required: true,
    showPreview: false,
    showProgress: true,
  } as FileUploadConfig,

  birthCertificate: {
    allowedTypes: ['application/pdf', '.pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    required: true,
    showPreview: false,
    showProgress: true,
  } as FileUploadConfig,

  educationalCertificate: {
    allowedTypes: ['application/pdf', '.pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    required: true,
    showPreview: false,
    showProgress: true,
  } as FileUploadConfig,

  electricalLicense: {
    allowedTypes: ['application/pdf', '.pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    required: true,
    showPreview: false,
    showProgress: true,
  } as FileUploadConfig,

  experienceCertificate: {
    allowedTypes: ['application/pdf', '.pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    required: false,
    showPreview: false,
    showProgress: true,
  } as FileUploadConfig,

  // Multiple documents (for bulk uploads)
  multipleDocuments: {
    allowedTypes: ['application/pdf', '.pdf', 'image/jpeg', '.jpg'],
    maxSize: 5 * 1024 * 1024, // 5MB per file
    multiple: true,
    required: false,
    showPreview: true,
    showProgress: true,
  } as FileUploadConfig,

  // Generic configurations
  anyPdf: {
    allowedTypes: ['application/pdf', '.pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    required: true,
    showPreview: false,
    showProgress: true,
  } as FileUploadConfig,

  anyImage: {
    allowedTypes: ['image/jpeg', 'image/png', '.jpg', '.jpeg', '.png'],
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false,
    required: true,
    showPreview: true,
    showProgress: true,
  } as FileUploadConfig,

  // Legacy mapping for existing FileUpload component
  uploadPan: {
    allowedTypes: ['application/pdf', '.pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    required: true,
    showPreview: false,
    showProgress: true,
  } as FileUploadConfig,
};

// Document type mappings for different modules
export const moduleDocumentMappings = {
  contractor: {
    profilePhoto: documentUploadConfigs.profilePhoto,
    signature: documentUploadConfigs.signature,
    partnerPhoto: documentUploadConfigs.partnerPhoto,
    uploadPan: documentUploadConfigs.panCard,
  },
  supervisor: {
    panCard: documentUploadConfigs.panCard,
    aadhaarCard: documentUploadConfigs.aadhaarCard,
    birthCertificate: documentUploadConfigs.birthCertificate,
    educationalCertificate: documentUploadConfigs.educationalCertificate,
    electricalLicense: documentUploadConfigs.electricalLicense,
    experienceCertificate: documentUploadConfigs.experienceCertificate,
  },
  wireman: {
    panCard: documentUploadConfigs.panCard,
    aadhaarCard: documentUploadConfigs.aadhaarCard,
    birthCertificate: documentUploadConfigs.birthCertificate,
    educationalCertificate: documentUploadConfigs.educationalCertificate,
    electricalLicense: documentUploadConfigs.electricalLicense,
  },
};

// Helper function to get upload config for a specific document type
export const getUploadConfig = (
  module: 'contractor' | 'supervisor' | 'wireman',
  documentType: string
): FileUploadConfig => {
  const moduleConfig = moduleDocumentMappings[module];
  
  if (moduleConfig && documentType in moduleConfig) {
    return moduleConfig[documentType as keyof typeof moduleConfig];
  }
  
  // Fallback to generic config based on document type name
  if (documentType.toLowerCase().includes('photo') || documentType.toLowerCase().includes('image')) {
    return documentUploadConfigs.anyImage;
  }
  
  return documentUploadConfigs.anyPdf;
};

// Custom validation functions
export const customValidations = {
  panCard: (_file: File): string | null => {
    // Add PAN card specific validation if needed
    return null;
  },
  
  aadhaar: (_file: File): string | null => {
    // Add Aadhaar card specific validation if needed
    return null;
  },
  
  electricalLicense: (_file: File): string | null => {
    // Add electrical license specific validation if needed
    return null;
  },
};

// Migration helper for existing FileUpload component usage
export const getLegacyUploadConfig = (
  allowedFileTypes: string,
  name: 'profilePhoto' | 'signature' | 'partnerPhoto' | 'uploadPan'
): FileUploadConfig => {
  const baseConfig = documentUploadConfigs[name] || documentUploadConfigs.anyImage;
  
  // Parse legacy allowedFileTypes format
  const types = allowedFileTypes.split(',').map(type => type.trim());
  
  return {
    ...baseConfig,
    allowedTypes: types,
  };
};