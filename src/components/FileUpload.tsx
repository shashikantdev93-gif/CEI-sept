import React, { useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { axiosInterceptor } from '../lib/interceptor';

const formatDateTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${day}${hours}${minutes}`;
};


interface FileUploadProps {
  allowedFileTypes: string;
  onFileUploaded: (info: { formControlName: string; serverResponse: any }) => void;
  name: 'profilePhoto' | 'signature' | 'partnerPhoto' | 'uploadPan';
  error?: string;
}


const FileUpload: React.FC<FileUploadProps> = ({ 
  allowedFileTypes, 
  onFileUploaded, 
  name, 
  error 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 [FILE-UPLOAD] File selected:', file.name);

    // Validate file type
    if (!file.type.includes('image/jpeg')) {
      console.error('❌ [FILE-UPLOAD] Invalid file type. Only JPG files are allowed.');
      alert('Please upload a JPG file');
      return;
    }

    // Validate file size (1MB = 1024 * 1024 bytes)
    if (file.size > 1024 * 1024) {
      console.error('❌ [FILE-UPLOAD] File size exceeds 1MB limit.');
      alert('File size should be less than 1MB');
      return;
    }

    const timestamp = formatDateTime();
    const fileName = `,_${timestamp}_${file.name}`;
    console.log('📁 [FILE-UPLOAD] Formatted filename:', fileName);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('formControlName', name);
    
    // Log FormData contents for debugging
    console.log('📁 [FILE-UPLOAD] FormData contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    console.log('📁 [FILE-UPLOAD] Preparing to upload file');
    setIsUploading(true);

    try {
      // Don't encrypt FormData - send it directly
      const response = await axiosInterceptor.post(
        '/UploadFile',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          // Add this to prevent interceptor from processing FormData
          transformRequest: [(data) => data]
        }
      );

      console.log('✅ [FILE-UPLOAD] Upload successful:', response);

      // Store the formatted file path in localStorage
      localStorage.setItem(`${name}Path`, fileName);

      onFileUploaded({
        formControlName: name,
        serverResponse: response.data
      });
    } catch (error) {
      console.error('❌ [FILE-UPLOAD] Upload failed:', error);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear the file input
      }
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Form.Control
        ref={fileInputRef}
        type="file"
        accept={allowedFileTypes}
        onChange={handleFileChange}
        className="form-control-sm"
        isInvalid={!!error}
      />
      {isUploading && <span className="text-primary small">Uploading...</span>}
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
};

export default FileUpload;


