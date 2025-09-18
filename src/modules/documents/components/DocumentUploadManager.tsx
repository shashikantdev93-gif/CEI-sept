/**
 * Unified Document Upload Component
 * Replaces individual upload components with configurable single component
 */

import React from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import UploadData from '../../../components/PageComponent/UploadData';
import type { DocumentUploadConfig } from '../types/DocumentTypes';
import { useDocumentUpload } from '../hooks/useDocumentUpload';

interface DocumentUploadManagerProps {
  config: DocumentUploadConfig;
  title?: string;
  subtitle?: string;
  nextRoute?: string;
  onSuccess?: () => void;
  className?: string;
}

const DocumentUploadManager: React.FC<DocumentUploadManagerProps> = ({
  config,
  title = `Upload ${config.moduleType} Documents`,
  subtitle = `Please upload all required documents for ${config.moduleType} registration`,
  nextRoute,
  onSuccess,
  className = ''
}) => {
  const navigate = useNavigate();
  
  const {
    documents,
    isLoading,
    error,
    isSubmitting,
    handleDocumentUpload,
    handleDocumentRemove,
    handleSubmit,
    clearError,
    validateDocuments,
    getValidationErrors
  } = useDocumentUpload(config);



  const handleSubmitAndProceed = async () => {
    const validationErrors = getValidationErrors();
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return;
    }

    await handleSubmit();

    // Call success callback or navigate to next route
    if (onSuccess) {
      onSuccess();
    } else if (nextRoute) {
      navigate(nextRoute);
    }
  };

  const handleSaveAndContinue = () => {
    // For "Save & Continue" functionality - validate and navigate even with partial uploads
    const requiredDocuments = documents.filter(doc => doc.isRequired);
    const uploadedRequiredDocuments = requiredDocuments.filter(doc => doc.uploadedFile);
    
    if (uploadedRequiredDocuments.length === 0) {
      console.log('❌ At least one required document must be uploaded');
      return;
    }

    if (nextRoute) {
      navigate(nextRoute);
    }
  };

  if (isLoading) {
    return (
      <Container className="mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading documents...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className={`document-upload-manager ${className}`}>
      <Container>
        <div className="row justify-content-center">
          <div className="col-md-10">
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">
                  <i className="bi bi-cloud-upload me-2"></i>
                  {title}
                </h4>
                <p className="mb-0 mt-1 opacity-75">{subtitle}</p>
              </Card.Header>
              
              <Card.Body>
                {error && (
                  <Alert variant="danger" dismissible onClose={clearError}>
                    <Alert.Heading>Upload Error</Alert.Heading>
                    <p className="mb-0">{error}</p>
                  </Alert>
                )}

                <div className="document-upload-section">
                  <UploadData
                    documents={documents}
                    onFileUpload={(documentId, file) => file ? handleDocumentUpload(documentId, file) : handleDocumentRemove(documentId)}
                    onRemoveFile={handleDocumentRemove}
                    disableSubmit={isSubmitting}
                    onSubmit={handleSubmitAndProceed}
                    onBack={() => window.history.back()}
                    title={title}
                    submitLabel="Submit Documents"
                  />
                </div>

                <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                  <div>
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Required documents are marked with *
                    </small>
                  </div>
                  
                  <div className="d-flex gap-3">
                    <Button
                      variant="outline-secondary"
                      onClick={handleSaveAndContinue}
                      disabled={isSubmitting}
                      className="px-4"
                    >
                      <i className="bi bi-bookmark me-2"></i>
                      Save & Continue
                    </Button>
                    
                    <Button
                      variant="primary"
                      onClick={handleSubmitAndProceed}
                      disabled={isSubmitting || !validateDocuments()}
                      className="px-4"
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Submit Documents
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
            
            {/* Upload Progress Summary */}
            <Card className="mt-3 shadow-sm">
              <Card.Body className="py-3">
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted">Upload Progress:</small>
                    <div className="d-flex align-items-center mt-1">
                      <div className="progress flex-grow-1" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-success"
                          style={{
                            width: `${(documents.filter(doc => doc.uploadedFile).length / documents.length) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="ms-2 small">
                        {documents.filter(doc => doc.uploadedFile).length} / {documents.length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <small className="text-muted">Required Documents:</small>
                    <div className="d-flex align-items-center mt-1">
                      <div className="progress flex-grow-1" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-warning"
                          style={{
                            width: `${(documents.filter(doc => doc.isRequired && doc.uploadedFile).length / documents.filter(doc => doc.isRequired).length) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="ms-2 small">
                        {documents.filter(doc => doc.isRequired && doc.uploadedFile).length} / {documents.filter(doc => doc.isRequired).length}
                      </span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DocumentUploadManager;