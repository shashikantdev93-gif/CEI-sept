import React, { useEffect } from "react";
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/shared-component/DataTable';
import DetailsTable from '../../components/shared-component/DetailsTable';
import { useProjectSiteAPI } from '../../hooks/useProjectSiteAPI';
// Fix: Import the correct interfaces
import { ProjectSiteDataMapper, type ProjectDetailsField, type ApplicationData } from '../../utils/projectSiteDataMapper';

const ProjectDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Use the universal API hook with project details configuration
  const {
    projectSiteData,
    loading,
    error,
    refreshData
  } = useProjectSiteAPI({
    pageType: 'projectDetails',
    enableCounts: false,
    autoLoad: true,
    onDataLoaded: (data) => {
      console.log('🎯 [Project Details]: Data loaded callback:', data);
    },
    onError: (error) => {
      console.error('🎯 [Project Details]: Error callback:', error);
    }
  });
  
  useEffect(() => {
    console.log('ProjectDetails - Cleaning up navigation flags');
    sessionStorage.removeItem('allowProjectDetailsNavigation');
    
    return () => {
      sessionStorage.removeItem('allowProjectDetailsNavigation');
    };
  }, []);

  const handleApplyForClearances = () => {
    console.log('Apply For Clearances button clicked, navigating to /ApplicationForm');
    sessionStorage.setItem('allowApplicationFormNavigation', 'true');
    console.log('ProjectDetails - Set allowApplicationFormNavigation flag');
    navigate('/dashboard/ProjectDetails/applicationForm');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Fix: Add proper return type and null safety
  const getMappedData = (): {
    detailsFields: ProjectDetailsField[];
    applications: ApplicationData[];
  } => {
    if (!projectSiteData) {
      return {
        detailsFields: [
          { label: "PIN:", value: "Loading...", isHighlighted: true },
          { label: "Date:", value: "Loading..." },
          { label: "Applicant Name:", value: "Loading..." },
          { label: "Application Purpose:", value: "Loading..." },
          { label: "Mobile No:", value: "Loading..." },
          { label: "Site Details:", value: "Loading..." },
          { label: "Email:", value: "Loading..." },
        ],
        applications: []
      };
    }
    
    console.log('🔍 [Project Details]: Raw projectSiteData:', projectSiteData);
    console.log('🔍 [Project Details]: Applications array:', projectSiteData.applications);
    
    const mappedData = ProjectSiteDataMapper.mapForPage(projectSiteData, 'projectDetails');
    
    console.log('🔍 [Project Details]: Mapped data:', mappedData);
    console.log('🔍 [Project Details]: Applications count:', mappedData.applications?.length || 0);
    
    return {
      detailsFields: mappedData.detailsFields || [],
      applications: mappedData.applications || []
    };
  };

  const { detailsFields, applications } = getMappedData();

  // Loading state
  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center" style={{ paddingTop: '80px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading project details...</p>
        </div>
      </div>
    );
  }

  // Action handlers with proper functionality descriptions
  const handleProcessingLog = (rowData: any) => {
    console.log('📋 [Project Details]: Processing log clicked:', rowData);
    // Handle processing log view logic - show application processing history
  };

  const handleDownloadFile = (rowData: any) => {
    console.log('📥 [Project Details]: Download file clicked:', rowData);
    // Handle file download logic - download application documents
  };

  const handlePaymentTransaction = (rowData: any) => {
    console.log('💳 [Project Details]: Payment transaction clicked:', rowData);
    // Handle payment transaction view logic - show payment history and status
  };

  const handleDraft = (rowData: any) => {
    console.log('🔄 [DRAFT-FLOW] === DRAFT BUTTON CLICKED ===');
    console.log('📊 [DRAFT-FLOW] Step 1: Button click triggered');
    console.log('📋 [DRAFT-FLOW] Row data received:', rowData);
    
    // Extract application data from rowData - handle JSX content properly
    let applicationIdText = '';
    if (typeof rowData["Application ID / Name"] === 'object' && rowData["Application ID / Name"]?.props?.children) {
      // Extract text from JSX structure
      const children = rowData["Application ID / Name"].props.children;
      if (Array.isArray(children)) {
        applicationIdText = children.filter(child => typeof child === 'string').join('');
      } else if (typeof children === 'string') {
        applicationIdText = children;
      }
    } else if (typeof rowData["Application ID / Name"] === 'string') {
      applicationIdText = rowData["Application ID / Name"];
    }
    
    // CRITICAL FIX: Extract the real backend application ID
    // Angular uses the actual application ID from the API response (like 3598)
    // We need to get this from the projectSiteData, not use frontend table row IDs
    let realAppId = null;
    
    console.log('🔍 [DRAFT-FLOW] Searching for real backend application ID...');
    console.log('🔍 [DRAFT-FLOW] Frontend row ID (not backend appId):', rowData.ID || rowData.id);
    console.log('🔍 [DRAFT-FLOW] Application ID text:', applicationIdText);
    
    // Find the actual application in projectSiteData that matches this row
    if (projectSiteData && projectSiteData.applications) {
      console.log('🔍 [DRAFT-FLOW] Searching in projectSiteData.applications...');
      
      // Find application by matching application ID text or other unique identifier
      const matchingApplication = projectSiteData.applications.find((app: any) => {
        const appIdMatch = app.publicAppRefNum === applicationIdText || 
                          app.applicationId === applicationIdText ||
                          app.appId === applicationIdText;
        console.log('🔍 [DRAFT-FLOW] Checking app:', {
          appId: app.appId,
          publicAppRefNum: app.publicAppRefNum,
          applicationId: app.applicationId,
          matches: appIdMatch
        });
        return appIdMatch;
      });
      
      if (matchingApplication) {
        realAppId = matchingApplication.appId;
        console.log('✅ [DRAFT-FLOW] Found matching application with real backend appId:', realAppId);
        console.log('✅ [DRAFT-FLOW] Matching application data:', matchingApplication);
      } else {
        console.warn('⚠️ [DRAFT-FLOW] No matching application found in projectSiteData');
        console.warn('⚠️ [DRAFT-FLOW] Available applications:', projectSiteData.applications);
      }
    }
    
    // Fallback: if we can't find the real appId, try to extract from applicationIdText
    if (!realAppId && applicationIdText) {
      // Try to extract numeric ID from application ID text if it contains one
      const numericMatch = applicationIdText.match(/\d+/);
      if (numericMatch) {
        realAppId = parseInt(numericMatch[0]);
        console.log('🔍 [DRAFT-FLOW] Extracted numeric ID from application text:', realAppId);
      }
    }
    
    // Final fallback - use the frontend ID (this may cause 404 errors)
    if (!realAppId) {
      realAppId = rowData.ID || rowData.id;
      console.warn('⚠️ [DRAFT-FLOW] Using frontend row ID as fallback (may cause 404):', realAppId);
    }
    
    const applicationData = {
      appId: realAppId, // Use the real backend application ID
      applicationId: applicationIdText,
      currentStatus: rowData["Current Status"],
      submittedOn: rowData["Submitted On"],
      updatedOn: rowData["Updated On"],
      paymentStatus: rowData["Payment Status"]
    };
    
    console.log('📋 [DRAFT-FLOW] Application data extracted with real appId:', applicationData);
    console.log('📋 [DRAFT-FLOW] Real backend appId (Angular compatible):', realAppId);
    console.log('📋 [DRAFT-FLOW] Application ID text:', applicationIdText);
    
    // Determine application type based on application ID pattern or status
    let applicationType = 6; // Default to contractor
    let applicationPurposeType = 1; // Default to new registration
    
    // Check if it's a contractor application (CONTR prefix)
    if (applicationIdText && applicationIdText.includes('CONTR')) {
      applicationType = 6; // Contractor
      console.log('🔄 [DRAFT-FLOW] Step 2: Contractor Registration route detected');
    } else if (applicationIdText && applicationIdText.includes('WIRE')) {
      applicationType = 7; // Wireman
      console.log('🔄 [DRAFT-FLOW] Step 2: Wireman Registration route detected');
    } else if (applicationIdText && applicationIdText.includes('SUPER')) {
      applicationType = 8; // Supervisor
      console.log('🔄 [DRAFT-FLOW] Step 2: Supervisor Registration route detected');
    } else {
      console.log('🔄 [DRAFT-FLOW] Step 2: Default Contractor Registration route detected (no pattern match)');
    }
    
    console.log('📋 [DRAFT-FLOW] Application Type:', applicationType);
    console.log('📋 [DRAFT-FLOW] Application Purpose Type:', applicationPurposeType);
    
    // Store application data in sessionStorage for the target component
    const draftData = {
      appId: applicationData.appId,
      applicationType: applicationType,
      applicationPurposeType: applicationPurposeType,
      applicationId: applicationIdText, // Use the extracted text instead of JSX
      currentStatus: applicationData.currentStatus,
      submittedOn: applicationData.submittedOn,
      updatedOn: applicationData.updatedOn,
      paymentStatus: applicationData.paymentStatus,
      mode: 'edit', // This is a draft, so edit mode
      formMode: 'edit'
    };
    
    console.log('🔑 [DRAFT-FLOW] Storing draft data in sessionStorage:', draftData);
    
    try {
      sessionStorage.setItem('draftApplicationData', JSON.stringify(draftData));
      sessionStorage.setItem('allowDraftNavigation', 'true');
      console.log('✅ [DRAFT-FLOW] Successfully stored draft data in sessionStorage');
      
      let targetRoute = '';
      
      // Route based on application type
      switch (applicationType) {
        case 6: // Contractor
          targetRoute = '/dashboard/ProjectDetails/applicationForm/contractor-applicant-details';
          console.log('🔄 [DRAFT-FLOW] Preparing to navigate to contractor-applicant-details page');
          break;
        case 7: // Wireman
          targetRoute = '/dashboard/ProjectDetails/applicationForm/wireman-information-new';
          console.log('🔄 [DRAFT-FLOW] Preparing to navigate to wireman-information-new page');
          break;
        case 8: // Supervisor
          targetRoute = '/dashboard/ProjectDetails/applicationForm/supervisor-registration';
          console.log('🔄 [DRAFT-FLOW] Preparing to navigate to supervisor-registration page');
          break;
        default:
          targetRoute = '/dashboard/ProjectDetails/applicationForm/contractor-applicant-details';
          console.log('🔄 [DRAFT-FLOW] Default route: contractor-applicant-details page');
      }
      
      console.log('🎯 [DRAFT-FLOW] Target route determined:', targetRoute);
      console.log('🔄 [DRAFT-FLOW] Form mode being set: edit');
      
      // Navigate to the appropriate form
      navigate(targetRoute);
      
      console.log('🎯 [DRAFT-FLOW] Navigation attempted to:', targetRoute);
      console.log('✅ [DRAFT-FLOW] Successfully initiated navigation');
      
    } catch (error) {
      console.error('❌ [DRAFT-FLOW] Error storing data or navigation failed:', error);
    }
    
    console.log('🔚 [DRAFT-FLOW] === DRAFT FUNCTION COMPLETED ===');
  };

  // Error state
  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center" style={{ paddingTop: '80px' }}>
        <div className="text-center">
          <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
          <h4 className="mt-3 text-danger">Error Loading Project Details</h4>
          <p className="text-muted">{error}</p>
          <Button variant="primary" onClick={() => refreshData()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light project-details-container" style={{ paddingTop: '80px' }}>
      <Container fluid className="px-0" style={{ maxWidth: '1500px' }}>
        <div className="bg-white rounded shadow-sm mx-auto" style={{ width: '90%', maxWidth: '1500px', padding: '32px' }}>
          
          <Card className="border-4 mb-4 ms-2 project-details-card" style={{ width: '97%' }}>
            <Card.Body className="p-4 bg-white rounded">
              
              <h5 className="mb-3 project-title">
                Project Details
                <i className="bi bi-person-lines-fill ms-2" style={{ color: "#0056b3" }}></i>
              </h5>

              {/* Fix: Use properly typed fields */}
              <DetailsTable fields={detailsFields} />

              {/* Action Buttons */}
              <div className="d-flex flex-column flex-md-row action-buttons pt-3">
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="d-flex align-items-center justify-content-center btn-primary-custom" 
                  onClick={handleApplyForClearances}
                >
                  <i className="bi bi-file-earmark-text-fill me-2" style={{ fontSize: "15px" }}></i>
                  Apply For New Clearances
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="d-flex align-items-center justify-content-center btn-secondary-custom" 
                  onClick={handleBackToDashboard}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back To Dashboard
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Inbox Section */}
          <div className="mt-5 p-3">
            <Card className="border-3 shadow-sm inbox-card">
              <Card.Body className="p-4">
                
                {/* Header with Search */}
                <Row className="align-items-center mb-3">
                  <Col md={6} className="d-flex align-items-center">
                    <h6 className="mb-0 me-2 inbox-title">
                      Inbox
                    </h6>
                    <i className="bi bi-inbox-fill" style={{ color: '#0056b3', fontSize: "22px" }}></i>
                  </Col>
                  <Col md={6} className="text-end">
                    <input
                      type="text"
                      className="form-control d-inline-block search-input"
                      placeholder="Search By Application ID"  
                      style={{ maxWidth: "280px" }}
                    />
                  </Col>
                </Row>

                {/* Enhanced Applications Table with Action Buttons */}
                {applications.length > 0 ? (
                  <DataTable
                    title="Inbox"
                    columns={[
                      "ID",
                      "Application ID / Name",
                      "Submitted On",
                      "Current Status",
                      "Updated On",
                      "Action",
                      "Payment Status"
                    ]}
                    rows={applications.map(row => ({
                      "ID": row.id,
                      "Application ID / Name": (
                        <>
                          {row.applicationId}<br />
                          {row.applicationName}
                        </>
                      ),
                      "Submitted On": row.submittedOn,
                      "Current Status": row.currentStatus,
                      "Updated On": row.updatedOn,
                      "Action": row.action,
                      "Payment Status": row.paymentStatus,
                      // Pass additional backend data for action handlers
                      backendAppId: row.backendAppId,
                      applicationType: row.applicationType,
                      applicationPurposeType: row.applicationPurposeType,
                      applicationLifeCycleStatusType: row.applicationLifeCycleStatusType,
                      appActionType: row.appActionType
                    }))}
                    isMobileView={window.innerWidth < 768}
                    forceHorizontalActions={true}
                    showOnlyIcons={true} // Add this to show only icons with tooltips
                    // Define multiple actions with proper labels and icons
                    multipleActions={[
                      {
                        label: 'Processing Log',
                        icon: 'bi-list-check',
                        variant: 'info',
                        onClick: handleProcessingLog
                      },
                      {
                        label: 'Download File',
                        icon: 'bi-download',
                        variant: 'success',
                        onClick: handleDownloadFile
                      },
                      {
                        label: 'Payment Transaction',
                        icon: 'bi-credit-card',
                        variant: 'warning',
                        onClick: handlePaymentTransaction
                      },
                       {
                        label: 'Draft',
                        icon: 'bi-pencil-square',
                        variant: 'secondary',
                        onClick: handleDraft
                      }

                    ]}
                  />
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                    </div>
                    <h6 className="text-muted mb-2">No Applications Found</h6>
                    <p className="text-muted small">
                      No applications have been submitted for this project site yet.
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>

      {/* ...existing styles... */}
      <style>{`
        /* Project Details Styles */
        * {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }

        .project-details-container {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }
        
        .project-details-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .project-title {
          color: #0056b3;
          font-weight: bold;
          font-size: 1.125rem;
          letter-spacing: -0.025em;
        }
        
        .project-pin {
          color: #1e88e5;
          font-weight: bold;
          font-size: 1.25rem;
          text-shadow: none;
        }
        
        .project-table {
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        
        /* Sleek Project Table Borders */
        .sleek-project-table {
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid #e1e5e9;
        }
        
        .sleek-project-td {
          border-right: 1px solid #e1e5e9 !important;
          border-bottom: 1px solid #e1e5e9 !important;
          border-color: rgba(0, 0, 0, 0.06);
          padding: 1rem;
          vertical-align: middle;
          transition: all 0.3s ease;
        }
        
        .sleek-project-td:last-child {
          border-right: none !important;
        }
        
        .sleek-project-tr:last-child .sleek-project-td {
          border-bottom: none !important;
        }
        
        .sleek-project-td-empty {
          border-right: 1px solid #e1e5e9 !important;
          border-bottom: 1px solid #e1e5e9 !important;
          border-top: none !important;
          border-left: none !important;
        }
        
        .sleek-project-td-empty:last-child {
          border-right: none !important;
        }
        
        .project-table td {
          border-color: rgba(0, 0, 0, 0.06);
          padding: 1rem;
          vertical-align: middle;
        }
        
        .project-table .table-label {
          background: #c7ced1;
          font-weight: bold;
          color: #000000;
          font-size: 0.8125rem;
          text-shadow: none;
          border-right: 2px solid #ffffff;
        }
        
        .project-table .table-value {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          color: #495057;
          font-size: 0.8125rem;
          font-weight: bold;
        }
        
        .action-buttons {
          gap: 0.75rem;
        }
        
        .btn-primary-custom {
          background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
          border: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 0.8125rem;
          padding: 0.625rem 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(13, 110, 253, 0.25);
        }
        
        .btn-primary-custom:hover {
          background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(13, 110, 253, 0.35);
        }
        
        .btn-secondary-custom {
          background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
          border: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 0.8125rem;
          padding: 0.625rem 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(108, 117, 125, 0.25);
        }
        
        .btn-secondary-custom:hover {
          background: linear-gradient(135deg, #495057 0%, #343a40 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(108, 117, 125, 0.35);
        }
        
        .inbox-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .inbox-title {
          color: #0056b3;
          font-weight: bold;
          font-size: 1.50rem;
        }
        
        .search-input {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 0.625rem 1rem;
          font-size: 0.8125rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .search-input:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
          outline: none;
        }
        
        .data-table {
          border-radius: 12px !important;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        
        /* Sleek Inbox Table Borders */
        .sleek-inbox-table {
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid #e1e5e9;
        }
        
        .sleek-inbox-th {
          border-right: 1px solid #dee2e6 !important;
          border-bottom: 1px solid #dee2e6 !important;
          background: #c7ced1 !important;
          border-color: rgba(0, 0, 0, 0.06) !important;
          font-weight: bold !important;
          color: #000000 !important;
          font-size: 0.75rem !important;
          padding: 1rem 0.75rem !important;
          text-shadow: none !important;
        }
        
        .sleek-inbox-th:last-child {
          border-right: none !important;
        }
        
        .sleek-inbox-td {
          border-right: 1px solid #e1e5e9 !important;
          border-bottom: 1px solid #e1e5e9 !important;
          border-color: rgba(0, 0, 0, 0.06);
          font-size: 0.75rem;
          padding: 1rem 0.75rem;
          color: #495057;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        
        .sleek-inbox-td:last-child {
          border-right: none !important;
        }
        
        .sleek-inbox-tr:last-child .sleek-inbox-td {
          border-bottom: none !important;
        }
        
        .sleek-inbox-tr:hover .sleek-inbox-td {
          background: rgba(3, 64, 120, 0.05) !important;
          border-color: rgba(3, 64, 120, 0.2) !important;
        }
        
        .data-table th {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-color: rgba(0, 0, 0, 0.06);
          font-weight: bold;
          color: #495057;
          font-size: 0.75rem;
          padding: 1rem 0.75rem;
        }
        
        .data-table td {
          border-color: rgba(0, 0, 0, 0.06);
          font-size: 0.75rem;
          padding: 1rem 0.75rem;
          color: #495057;
          font-weight: bold;
        }
        
        .mobile-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 8px;
          margin-bottom: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .mobile-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        .mobile-card-field {
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding: 0.75rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .mobile-card-field:last-child {
          border-bottom: none;
        }
        
        .mobile-card-label {
          font-weight: bold;
          color: #000000;
          background: #c7ced1;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
          padding: 0.375rem 0.75rem;
          border-radius: 4px;
          text-shadow: none;
          display: inline-block;
          min-width: 120px;
        }
        
        .mobile-card-value {
          color: #0d6efd;
          font-size: 0.75rem;
          font-weight: bold;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .project-details-container {
            padding-top: 1rem !important;
          }
          
          .container-fluid {
            padding: 0 !important;
          }
          
          .bg-white.rounded.shadow-sm {
            margin: 0 !important;
            border-radius: 0 !important;
            padding: 1rem !important;
            width: 100% !important;
          }
          
          .project-details-card {
            margin-left: 0 !important;
            width: 100% !important;
            border-radius: 8px !important;
          }
          
          .action-buttons .btn {
            width: 100% !important;
            margin-bottom: 0.5rem;
          }
          
          .action-buttons .btn:first-child {
            margin-bottom: 0.75rem;
          }
          
          .search-input {
            width: 100% !important;
            max-width: none !important;
            margin-top: 0.75rem;
          }
          
          .inbox-title {
            font-size: 1.125rem;
          }
        }
        
        @media (max-width: 475px) {
          .project-details-container {
            padding-top: 70px !important;
          }
          
          .project-title {
            font-size: 1rem;
          }
          
          .project-pin {
            font-size: 1.125rem;
          }
          
          .mobile-card-field {
            padding: 0.5rem 0;
          }
          
          .mobile-card-label,
          .mobile-card-value {
            font-size: 0.6875rem;
          }
          
          .btn-primary-custom,
          .btn-secondary-custom {
            font-size: 0.75rem;
            padding: 0.5rem 0.75rem;
          }
        }
        
        @media (max-width: 376px) {
          .search-input {
            font-size: 0.75rem !important;
          }
        }
        
        @media (max-width: 320px) {
          .search-input {
            font-size: 0.6875rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectDetailsPage;