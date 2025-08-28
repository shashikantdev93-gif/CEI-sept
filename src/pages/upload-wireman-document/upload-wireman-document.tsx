import React, { useState, useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import UploadData from '../../components/PageComponent/UploadData';
import type { DocumentItem } from '../../components/PageComponent/UploadData';

const UploadWiremanDocument: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem('allowUploadWiremanDocumentNavigation');
    return () => {
      sessionStorage.removeItem('allowUploadWiremanDocumentNavigation');
    };
  }, []);

  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: 1,
      sNo: 1,
      documentName: 'PAN Card',
      formatMaxSize: 'PDF / 5MB',
      uploadedFile: null,
      fileName: ''
    },
    {
      id: 2,
      sNo: 2,
      documentName: 'Aadhaar Card',
      formatMaxSize: 'PDF / 5MB',
      uploadedFile: null,
      fileName: ''
    },
    {
      id: 3,
      sNo: 3,
      documentName: 'Birth Certificate',
      formatMaxSize: 'PDF / 5MB',
      uploadedFile: null,
      fileName: ''
    },
    {
      id: 4,
      sNo: 4,
      documentName: 'Educational Certificate',
      formatMaxSize: 'PDF / 5MB',
      uploadedFile: null,
      fileName: ''
    },
    {
      id: 5,
      sNo: 5,
      documentName: 'Experience Certificate',
      formatMaxSize: 'PDF / 5MB',
      uploadedFile: null,
      fileName: ''
    },
    {
      id: 6,
      sNo: 6,
      documentName: 'Passport Size Photo',
      formatMaxSize: 'JPG, PNG / 2MB',
      uploadedFile: null,
      fileName: ''
    }
  ]);

  const handleFileUpload = (documentId: number, file: File | null) => {
    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.id === documentId
          ? { ...doc, uploadedFile: file, fileName: file?.name || '' }
          : doc
      )
    );
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmitAndNext = () => {
    // Handle submit logic here
    console.log('Submitting uploaded documents and proceeding to next step...');
    console.log('Uploaded documents:', documents);
  };

  const steps = [
    { number: 1, icon: "bi-person", title: "Wireman Information", active: false },
    { number: 2, icon: "bi-upload", title: "Upload", active: true }
  ];

  return (
    <div className="upload-wireman-document-container min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
      <Container fluid className="px-0" style={{ maxWidth: '1200px' }}>
        <Card className="border-0 shadow-sm mb-1 mx-auto" style={{ width: '95%' }}>
          <Card.Body className="p-1">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-semibold text-primary text-center w-100">Upload Documents - Wireman Registration</h5>
            </div>
            <div className="border-0 shadow-sm mb-1 mt-2 mx-auto" style={{ width: '60%' }}>
              <div className="p-1">
                <div className="d-flex justify-content-between align-items-center position-relative">
                  <div
                    className="position-absolute w-100"
                    style={{
                      height: '1px',
                      backgroundColor: '#000000',
                      top: '50%',
                      zIndex: 1,
                    }}
                  ></div>
                  <div
                    className="position-absolute"
                    style={{
                      height: '4px',
                      backgroundColor: '#007bff',
                      width: '100%',
                      top: '50%',
                      zIndex: 2,
                      transition: 'width 0.3s ease',
                    }}
                  ></div>
                  {steps.map((step) => (
                    <div
                      key={step.number}
                      className="d-flex flex-column align-items-center position-relative"
                      style={{ zIndex: 3 }}
                    >
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center ${
                          step.active ? 'bg-primary text-white' : 'bg-light text-muted'
                        }`}
                        style={{
                          width: '40px',
                          height: '40px',
                          fontSize: '14px',
                          border: step.active ? 'none' : '1px solid #000000'
                        }}
                      >
                        <i className={step.icon}></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm mx-auto" style={{ width: '95%' }}>
          <Card.Body className="p-1">
            <div className="document-upload-section mb-1">
              <div className="table-responsive">
                <UploadData
                  documents={documents}
                  onFileUpload={handleFileUpload}
                  onRemoveFile={(id) => handleFileUpload(id, null)}
                  disableSubmit={documents.some(doc => !doc.uploadedFile)}
                  onSubmit={handleSubmitAndNext}
                  onBack={handleBack}
                  title="Documents to be uploaded"
                  submitLabel="Submit Uploaded Document & Next"
                />
              </div>
            </div>
            <div className="upload-instructions mb-4 p-3 bg-light border rounded">
              <h6 className="text-primary fw-semibold mb-3">
                <i className="bi bi-info-circle me-2"></i>
                Upload Instructions
              </h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  <small>All documents must be in PDF format unless specified otherwise</small>
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  <small>Maximum file size should not exceed the specified limit</small>
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  <small>Ensure documents are clear and readable</small>
                </li>
                <li className="mb-0">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  <small>All mandatory documents must be uploaded before submission</small>
                </li>
              </ul>
            </div>
            <div className="d-flex justify-content-between mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={handleBack}
                className="btn-outline-secondary fw-semibold"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
      <style>{`
        .upload-wireman-document-container {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .table {
          background-color: white;
          border: 1px solid #dee2e6;
        }
        .table th {
          background-color: #f8f9fa !important;
          border: 1px solid #dee2e6;
          font-weight: 600;
          color: #495057;
          font-size: 14px;
          padding: 12px 8px;
        }
        .table td {
          border: 1px solid #dee2e6;
          padding: 12px 8px;
          font-size: 13px;
          vertical-align: middle;
        }
        .table tbody tr:hover {
          background-color: #f8f9fa;
        }
        .form-control:focus {
          border-color: #0d6efd !important;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
        }
        .btn-primary {
          background-color: #0d6efd;
          border-color: #0d6efd;
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          background-color: #0b5ed7;
          border-color: #0a58ca;
          transform: translateY(-1px);
        }
        .btn-primary:disabled {
          background-color: #6c757d;
          border-color: #6c757d;
          opacity: 0.6;
          transform: none;
        }
        .btn-outline-secondary {
          border: 2px solid #6c757d;
          color: #6c757d;
          transition: all 0.3s ease;
        }
        .btn-outline-secondary:hover {
          background-color: #6c757d;
          border-color: #6c757d;
          color: white;
          transform: translateY(-1px);
        }
        .upload-instructions {
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
        }
        .upload-instructions li small {
          color: #495057;
          line-height: 1.5;
        }
        .position-absolute.bg-primary {
          width: 100% !important;
        }
        @media (max-width: 768px) {
          .upload-wireman-document-container {
            padding-top: 60px !important;
          }
          .table th,
          .table td {
            padding: 8px 4px;
            font-size: 12px;
          }
          .btn {
            font-size: 12px;
            padding: 6px 12px;
          }
        }
        @media (max-width: 576px) {
          .table th,
          .table td {
            padding: 6px 3px;
            font-size: 11px;
          }
          .upload-instructions li small {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default UploadWiremanDocument;