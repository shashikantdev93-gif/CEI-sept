import React, { useState, useRef, useCallback } from 'react';
import { Form, Button, ProgressBar, Alert } from 'react-bootstrap';
import { axiosInterceptor } from '../../lib/interceptor';

// Enhanced types for comprehensive file upload support
export interface FileUploadConfig {
  allowedTypes: string[];
  maxSize: number; // in bytes
  multiple?: boolean;
  required?: boolean;
  showPreview?: boolean;
  showProgress?: boolean;
  customValidation?: (file: File) => string | null;
}

export interface UploadedFile {
  file: File;
  url?: string;
  serverResponse?: any;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

export interface FileUploadProps {
  name: string;
  config: FileUploadConfig;
  onFileUploaded?: (files: UploadedFile[]) => void;
  onFileRemoved?: (fileName: string) => void;
  onUploadProgress?: (fileName: string, progress: number) => void;
  onError?: (error: string) => void;
  initialFiles?: UploadedFile[];
  disabled?: boolean;
  className?: string;
  error?: string;
  label?: string;
  helpText?: string;
}

const EnhancedFileUpload: React.FC<FileUploadProps> = ({
  name,
  config,
  onFileUploaded,
  onFileRemoved,
  onUploadProgress,
  onError,
  initialFiles = [],
  disabled = false,
  className = '',
  error,
  label,
  helpText
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format timestamp for filename
  const formatDateTime = useCallback(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${day}${hours}${minutes}`;
  }, []);

  // Validate file against configuration
  const validateFile = useCallback((file: File): string | null => {
    console.log('📁 [ENHANCED-UPLOAD] Validating file:', file.name);

    // Check file type
    const isValidType = config.allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.toLowerCase().includes(type.toLowerCase());
    });

    if (!isValidType) {
      const allowedTypesStr = config.allowedTypes.join(', ');
      return `Invalid file type. Allowed types: ${allowedTypesStr}`;
    }

    // Check file size
    if (file.size > config.maxSize) {
      const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    // Custom validation if provided
    if (config.customValidation) {
      return config.customValidation(file);
    }

    return null;
  }, [config]);

  // Upload single file to server
  const uploadFile = useCallback(async (file: File): Promise<UploadedFile> => {
    console.log('📁 [ENHANCED-UPLOAD] Starting upload for:', file.name);

    const timestamp = formatDateTime();
    const fileName = `,_${timestamp}_${file.name}`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('formControlName', name);

    // Create upload tracking object
    const uploadedFile: UploadedFile = {
      file,
      uploadProgress: 0,
      uploadStatus: 'uploading',
    };

    try {
      const response = await axiosInterceptor.post('/UploadFile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: [(data) => data],
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            uploadedFile.uploadProgress = progress;
            onUploadProgress?.(file.name, progress);
            
            // Update state with progress
            setUploadedFiles(prev => 
              prev.map(f => 
                f.file.name === file.name 
                  ? { ...f, uploadProgress: progress }
                  : f
              )
            );
          }
        }
      });

      // Store file path in localStorage (existing pattern compatibility)
      localStorage.setItem(`${name}Path`, fileName);

      uploadedFile.uploadStatus = 'success';
      uploadedFile.uploadProgress = 100;
      uploadedFile.serverResponse = response.data;
      uploadedFile.url = URL.createObjectURL(file);

      console.log('✅ [ENHANCED-UPLOAD] Upload successful:', file.name);
      return uploadedFile;

    } catch (error) {
      console.error('❌ [ENHANCED-UPLOAD] Upload failed:', error);
      uploadedFile.uploadStatus = 'error';
      uploadedFile.errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError?.(uploadedFile.errorMessage);
      return uploadedFile;
    }
  }, [name, formatDateTime, onUploadProgress, onError]);

  // Handle file selection and upload
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    console.log('📁 [ENHANCED-UPLOAD] Files selected:', files.length);

    // Validate files
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        validationErrors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    });

    // Show validation errors
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join('\n');
      onError?.(errorMessage);
      alert(errorMessage);
      return;
    }

    // Check multiple files constraint
    if (!config.multiple && validFiles.length > 1) {
      onError?.('Only one file is allowed');
      alert('Only one file is allowed');
      return;
    }

    // Check total files limit
    if (!config.multiple && uploadedFiles.length > 0) {
      onError?.('Please remove existing file before uploading a new one');
      alert('Please remove existing file before uploading a new one');
      return;
    }

    setIsUploading(true);

    try {
      // Create initial upload objects
      const initialUploadFiles: UploadedFile[] = validFiles.map(file => ({
        file,
        uploadProgress: 0,
        uploadStatus: 'uploading' as const,
      }));

      // Add to state immediately to show progress
      setUploadedFiles(prev => config.multiple ? [...prev, ...initialUploadFiles] : initialUploadFiles);

      // Upload files
      const uploadPromises = validFiles.map(file => uploadFile(file));
      const uploadResults = await Promise.all(uploadPromises);

      // Update final state
      setUploadedFiles(prev => {
        const newFiles = config.multiple 
          ? [...prev.filter(f => !uploadResults.some(r => r.file.name === f.file.name)), ...uploadResults]
          : uploadResults;
        
        onFileUploaded?.(newFiles);
        return newFiles;
      });

    } catch (error) {
      console.error('❌ [ENHANCED-UPLOAD] Batch upload failed:', error);
      onError?.('Failed to upload files');
    } finally {
      setIsUploading(false);
      
      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [config, uploadedFiles.length, validateFile, uploadFile, onFileUploaded, onError]);

  // Remove uploaded file
  const handleRemoveFile = useCallback((fileName: string) => {
    console.log('📁 [ENHANCED-UPLOAD] Removing file:', fileName);
    
    setUploadedFiles(prev => {
      const updatedFiles = prev.filter(f => f.file.name !== fileName);
      onFileUploaded?.(updatedFiles);
      return updatedFiles;
    });
    
    onFileRemoved?.(fileName);
    
    // Clear localStorage entry
    localStorage.removeItem(`${name}Path`);
  }, [name, onFileUploaded, onFileRemoved]);

  // Generate accept attribute for input
  const acceptAttribute = config.allowedTypes
    .filter(type => type.startsWith('.') || type.includes('/'))
    .join(',');

  return (
    <div className={`enhanced-file-upload ${className}`}>
      {label && (
        <Form.Label className="fw-semibold">
          {label}
          {config.required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}

      {helpText && (
        <div className="text-muted small mb-2">{helpText}</div>
      )}

      <Form.Control
        ref={fileInputRef}
        type="file"
        accept={acceptAttribute}
        multiple={config.multiple}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        isInvalid={!!error}
        className="form-control-sm"
      />

      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}

      {isUploading && (
        <div className="mt-2">
          <div className="text-primary small">Uploading files...</div>
        </div>
      )}

      {/* Upload Progress and File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-3">
          <div className="small text-muted mb-2">
            {config.multiple ? 'Uploaded Files:' : 'Uploaded File:'}
          </div>
          
          {uploadedFiles.map((uploadedFile, index) => (
            <div key={`${uploadedFile.file.name}-${index}`} className="border rounded p-2 mb-2 bg-light">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1 me-2">
                  <div className="small fw-semibold">{uploadedFile.file.name}</div>
                  <div className="text-muted small">
                    {(uploadedFile.file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                
                <div className="d-flex align-items-center gap-2">
                  {uploadedFile.uploadStatus === 'uploading' && config.showProgress && (
                    <ProgressBar 
                      now={uploadedFile.uploadProgress} 
                      style={{ width: '100px', height: '10px' }}
                    />
                  )}
                  
                  {uploadedFile.uploadStatus === 'success' && (
                    <span className="text-success small">✓</span>
                  )}
                  
                  {uploadedFile.uploadStatus === 'error' && (
                    <span className="text-danger small">✗</span>
                  )}
                  
                  {uploadedFile.uploadStatus !== 'uploading' && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveFile(uploadedFile.file.name)}
                      disabled={disabled}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {uploadedFile.uploadStatus === 'error' && uploadedFile.errorMessage && (
                <Alert variant="danger" className="mt-2 mb-0 py-1">
                  <small>{uploadedFile.errorMessage}</small>
                </Alert>
              )}

              {config.showPreview && uploadedFile.url && uploadedFile.file.type.startsWith('image/') && (
                <div className="mt-2">
                  <img 
                    src={uploadedFile.url} 
                    alt="Preview" 
                    className="img-thumbnail"
                    style={{ maxHeight: '100px', maxWidth: '150px' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedFileUpload;