import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import UploadData from '../../components/PageComponent/UploadData';
import type { DocumentItem } from '../../components/PageComponent/UploadData';
import encryptionService from '../../lib/encryptionService';
import SweetAlert from 'sweetalert2';
import { userDetailsService } from '../../services/api/userDetailsService';

const ContractorDocuments: React.FC = () => {
  const navigate = useNavigate();
  const location = useRouterLocation();
  
  // Application context from query parameters (Angular parity)
  const [applicationContext, setApplicationContext] = useState<{
    workingAreaList: any[];
    contractorFormMode: string;
    selectedWorkingAreaDistrictsList: any[];
    appRefId: number;
    contractorLicenceId: number;
    applicationContractorType: string;
    applicationIsLocked: boolean;
    renewAppId?: number;
    is30DaysCrossed?: boolean;
  } | null>(null);

  // Document management state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  // ✅ Query Parameter Processing (Angular Constructor Equivalent)
  useEffect(() => {
    console.log('🔄 [DOCUMENTS-INIT] ===== PROCESSING QUERY PARAMETERS =====');
    const urlParams = new URLSearchParams(location.search);
    
    try {
      // Decrypt and parse all query parameters (Angular attachments compatibility)
      const encryptedAppRefId = urlParams.get('appRefId');
      const encryptedFormMode = urlParams.get('formMode');
      const encryptedApplicationContractorType = urlParams.get('applicationContractorType');
      const encryptedIsFormLocked = urlParams.get('isFormLocked');
      const encryptedApplicationType = urlParams.get('applicationType');
      const encryptedAppformstep = urlParams.get('appformstep');
      const encryptedPreviousRouteUrl = urlParams.get('previousRouteUrl');
      const encryptedIs30DaysCrossed = urlParams.get('is30DaysCrossed');
      
      console.log('🔄 [DOCUMENTS-INIT] Received Angular-style parameters:', {
        appRefId: !!encryptedAppRefId,
        formMode: !!encryptedFormMode,
        applicationContractorType: !!encryptedApplicationContractorType,
        isFormLocked: !!encryptedIsFormLocked,
        applicationType: !!encryptedApplicationType,
        appformstep: !!encryptedAppformstep,
        previousRouteUrl: !!encryptedPreviousRouteUrl,
        is30DaysCrossed: !!encryptedIs30DaysCrossed
      });
      
      if (!encryptedAppRefId || !encryptedFormMode || !encryptedApplicationContractorType) {
        console.warn('⚠️ [DOCUMENTS-INIT] Missing required Angular-style query parameters');
        SweetAlert.fire({
          title: 'Navigation Error',
          text: 'Missing application data. Redirecting to contractor details.',
          icon: 'warning'
        }).then(() => {
          navigate('/dashboard/license/contractor-applicant-details');
        });
        return;
      }
      
      // Decrypt Angular-style parameters
      const appRefId = parseInt(encryptionService.get(encryptedAppRefId));
      const formModeNumber = parseInt(encryptionService.get(encryptedFormMode)); // Angular sends '1' or '2'
      const contractorFormMode = formModeNumber === 1 ? 'new' : 'renew'; // Convert to React format
      const applicationContractorType = encryptionService.get(encryptedApplicationContractorType);
      const applicationIsLocked = encryptedIsFormLocked ? JSON.parse(encryptionService.get(encryptedIsFormLocked)) : false;
      const applicationType = encryptedApplicationType ? parseInt(encryptionService.get(encryptedApplicationType)) : 6;
      const is30DaysCrossed = encryptedIs30DaysCrossed ? JSON.parse(encryptionService.get(encryptedIs30DaysCrossed)) : undefined;
      
      let appformstep = {};
      try {
        appformstep = encryptedAppformstep ? JSON.parse(encryptionService.get(encryptedAppformstep)) : {};
      } catch (parseError) {
        console.error('❌ [DOCUMENTS-INIT] Error parsing appformstep:', parseError);
        appformstep = {};
      }
      
      console.log('🔓 [DOCUMENTS-INIT] Decrypted Angular parameters:', {
        appRefId,
        formModeNumber,
        contractorFormMode,
        applicationContractorType,
        applicationIsLocked,
        applicationType,
        is30DaysCrossed,
        appformstep
      });
      
      // Validation: Form mode must be valid (Angular compatibility)
      if (!contractorFormMode || !['new', 'renew'].includes(contractorFormMode)) {
        console.error('❌ [DOCUMENTS-INIT] Invalid contractor form mode after conversion:', contractorFormMode);
        SweetAlert.fire({
          title: 'Invalid Form Mode',
          text: 'Invalid application form mode. Redirecting to contractor details.',
          icon: 'error'
        }).then(() => {
          navigate('/dashboard/license/contractor-applicant-details');
        });
        return;
      }
      
      // Set application context (with default working area data since Angular doesn't send it)
      setApplicationContext({
        workingAreaList: [], // Angular doesn't send this, will be fetched if needed
        contractorFormMode,
        selectedWorkingAreaDistrictsList: [], // Angular doesn't send this, will be fetched if needed  
        appRefId,
        contractorLicenceId: 0, // Default value, may need to fetch from API
        applicationContractorType,
        applicationIsLocked,
        renewAppId: undefined, // Not provided by Angular
        is30DaysCrossed
      });
      
      console.log('✅ [DOCUMENTS-INIT] Application context set successfully');
      
    } catch (error) {
      console.error('❌ [DOCUMENTS-INIT] Error processing query parameters:', error);
      SweetAlert.fire({
        title: 'Parameter Processing Error',
        text: 'Failed to process application data. Redirecting to contractor info.',
        icon: 'error'
      }).then(() => {
        navigate('/dashboard/license/contractor-applicant-details');
      });
    }
  }, [location.search, navigate]);

  // Fetch allowed documents based on application type
  useEffect(() => {
    const fetchAllowedDocuments = async () => {
      if (!applicationContext?.appRefId) {
        console.log("No appRefId available for fetching documents");
        return;
      }

      setIsLoadingDocuments(true);
      setDocumentsError(null);
      try {
        console.log("Fetching allowed documents for appRefId:", applicationContext.appRefId);
        const response = await userDetailsService.getApplicationTypeAllowDoc(applicationContext.appRefId);
        
        if (response && response.data && Array.isArray(response.data)) {
          console.log("Fetched allowed documents:", response.data);
          setDocuments(response.data);
        } else {
          console.warn("No documents found or invalid response structure:", response);
          setDocuments([]);
        }
      } catch (error) {
        console.error("Error fetching allowed documents:", error);
        setDocumentsError("Failed to load document requirements");
        // Keep existing empty array as fallback
        setDocuments([]);
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    fetchAllowedDocuments();
  }, [applicationContext?.appRefId]);

  // File upload handler
  const handleFileUpload = (documentId: number, file: File | null) => {
    console.log('📁 [DOCUMENTS] File upload for document ID:', documentId, 'File:', file?.name);
    
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === documentId 
          ? { ...doc, uploadedFile: file, fileName: file?.name || '' }
          : doc
      )
    );
  };

  // Remove file handler
  const handleRemoveFile = (documentId: number) => {
    console.log('🗑️ [DOCUMENTS] Removing file for document ID:', documentId);
    
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === documentId 
          ? { ...doc, uploadedFile: null, fileName: '' }
          : doc
      )
    );
  };

  // Back button handler
  const handleBack = () => {
    console.log('⬅️ [DOCUMENTS] Back button clicked - navigating to supervisor page');
    navigate(-1);
  };

  // Submit and next handler
  const handleSubmitAndNext = async () => {
    console.log('📤 [DOCUMENTS] Submit and next button clicked');
    console.log('📤 [DOCUMENTS] Current documents state:', documents);
    
    // Defensive guard for documents array
    if (!Array.isArray(documents) || documents.length === 0) {
      console.error('❌ [DOCUMENTS] Documents array is invalid or empty');
      SweetAlert.fire({
        title: 'System Error',
        text: 'Document list is not available. Please refresh the page.',
        icon: 'error',
        confirmButtonColor: '#007bff'
      });
      return;
    }
    
    // Basic validation - check if required documents are uploaded
    const requiredDocuments = documents.slice(0, 6); // First 6 documents are required
    const missingDocuments = requiredDocuments.filter(doc => !doc?.uploadedFile);
    
    if (missingDocuments.length > 0) {
      const missingNames = missingDocuments
        .map(doc => doc?.documentName || 'Unknown Document')
        .join(', ');
      
      SweetAlert.fire({
        title: 'Missing Documents',
        text: `Please upload the following required documents: ${missingNames}`,
        icon: 'warning',
        confirmButtonColor: '#007bff'
      });
      return;
    }
    
    // Success message and navigation
    SweetAlert.fire({
      title: 'Documents Uploaded Successfully!',
      text: 'All required documents have been uploaded. You can now proceed to the next step.',
      icon: 'success',
      confirmButtonColor: '#007bff'
    }).then(() => {
      // TODO: Add navigation to next page (payment/summary)
      console.log('✅ [DOCUMENTS] Navigation to next step would happen here');
      
      // For now, just show a placeholder message
      SweetAlert.fire({
        title: 'Feature Coming Soon',
        text: 'Payment/Final submission page is under development.',
        icon: 'info',
        confirmButtonColor: '#007bff'
      });
    });
  };

  // Progress steps configuration
  const steps = [
    { number: 1, icon: "bi-person", title: "Applicant Details", active: true },
    { number: 2, icon: "bi-people", title: "Supervisor Details", active: true },
    { number: 3, icon: "bi-file-text", title: "Documents", active: true },
    { number: 4, icon: "bi-upload", title: "Payment", active: false },
    { number: 5, icon: "bi-list-ul", title: "Summary", active: false }
  ];

  // Show loading if context is not ready
  if (!applicationContext) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ paddingTop: '80px' }}>
        <div className="text-center">
          <i className="bi bi-hourglass-split text-primary mb-3" style={{ fontSize: '48px' }}></i>
          <h5 className="text-primary">Loading Application Data...</h5>
          <p className="text-muted">Please wait while we process your application information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contractor-form-container min-vh-100" style={{ paddingTop: '80px', paddingBottom: '2px', backgroundColor: '#f8f9fa' }}>
      <Container fluid className="px-0" style={{ maxWidth: '1400px' }}>
        
        {/* Header Card with Progress Steps */}
        <Card className="border-0 shadow-sm mb-1 mt-2 mx-auto" style={{ width: '100%' }}>
          <Card.Body className="p-1">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center justify-content-between w-100">
                <h5 className="mb-0 fw-semibold text-primary text-center flex-grow-1">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Contractor Document Upload
                  {applicationContext.applicationIsLocked && (
                    <span className="badge bg-warning text-dark ms-2">
                      <i className="bi bi-lock me-1"></i>
                      Application Locked
                    </span>
                  )}
                </h5>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Progress Steps */}
        <div className="border-0 shadow-sm mb-1 mt-4 mx-auto" style={{ width: '100%' }}>
          <div className="p-1">
            <div className="d-flex justify-content-between align-items-center position-relative">
              <div className="position-absolute w-100" style={{ height: '1px', backgroundColor: '#000000', top: '50%', zIndex: 1 }}></div>
              <div className="position-absolute" style={{ height: '4px', backgroundColor: '#007bff', width: '75%', top: '50%', zIndex: 2, transition: 'width 0.3s ease' }}></div>
              
              {steps.map((step) => (
                <div key={step.number} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 3 }}>
                  <div 
                    className={`rounded-circle d-flex align-items-center justify-content-center ${step.active ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                    style={{ width: '40px', height: '40px', fontSize: '14px', border: step.active ? 'none' : '1px solid #000000' }}
                  >
                    <i className={step.icon}></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        {isLoadingDocuments ? (
          <Card className="border-0 shadow-sm mb-3 mx-auto" style={{ width: '100%' }}>
            <Card.Body className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 mb-0 text-muted">Loading document requirements...</p>
            </Card.Body>
          </Card>
        ) : documentsError ? (
          <Card className="border-0 shadow-sm mb-3 mx-auto border-danger" style={{ width: '100%' }}>
            <Card.Body className="text-center p-4">
              <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '2rem' }}></i>
              <h6 className="text-danger mt-2">Error Loading Documents</h6>
              <p className="text-muted mb-3">{documentsError}</p>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Retry
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <UploadData
            title="Documents to be uploaded"
            documents={documents}
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
            onSubmit={handleSubmitAndNext}
            onBack={handleBack}
            submitLabel="Submit Uploaded Document & Next"
            disableSubmit={applicationContext.applicationIsLocked}
          />
        )}

        {/* Enhanced styles with consistency to other pages */}
        <style>{`
          .contractor-form-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          .btn-navigation {
            padding: 0.5rem 1.5rem;
            font-weight: 600;
            border-radius: 0.375rem;
            transition: all 0.2s ease;
          }
          
          .btn-navigation:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          
          /* Progress step enhancements */
          .progress-step {
            transition: all 0.3s ease;
          }
          
          .progress-step.active {
            background: linear-gradient(135deg, #007bff, #0056b3);
            box-shadow: 0 4px 12px rgba(0,123,255,0.3);
          }
          
          /* Card styling consistency */
          .card {
            border-radius: 0.5rem;
            border: none;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          }
          
          /* Mobile responsiveness */
          @media (max-width: 768px) {
            .contractor-form-container {
              padding-top: 60px !important;
            }
            
            .navigation-buttons {
              flex-direction: column;
              gap: 1rem;
            }
            
            .btn-navigation {
              width: 100%;
            }
          }
        `}</style>
      </Container>
    </div>
  );
};

export default ContractorDocuments;
