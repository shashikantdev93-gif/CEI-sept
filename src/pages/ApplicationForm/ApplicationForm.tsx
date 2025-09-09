import React, { useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useApplicationAvailability } from '../../hooks/useApplicationAvailability';
import { ToastService } from '../../utils/navigation';

const ApplicationForm: React.FC = () => {
  const navigate = useNavigate();

  // NEW: Application availability check (Angular parity)
  const {
    contractorAppsExist,
    supervisorAppsExist,
    wiremanAppsExist,
    loading: availabilityLoading,
    error: availabilityError,
    debugInfo
  } = useApplicationAvailability({
    autoLoad: true,
    onError: (error) => {
      console.error('❌ [APPLICATION-FORM] Application availability error:', error);
      ToastService.error('Failed to check existing applications');
    }
  });

  // Debug logging for application availability
  useEffect(() => {
    console.log('🔍 [APPLICATION-FORM] Application availability state:', {
      contractorAppsExist,
      supervisorAppsExist,
      wiremanAppsExist,
      loading: availabilityLoading,
      error: availabilityError,
      debugInfo
    });
  }, [contractorAppsExist, supervisorAppsExist, wiremanAppsExist, availabilityLoading, availabilityError, debugInfo]);

  useEffect(() => {

    console.log('ApplicationForm - Cleaning up navigation flags');
    sessionStorage.removeItem('allowApplicationFormNavigation');
    
    return () => {
 
      sessionStorage.removeItem('allowApplicationFormNavigation');
    };
  }, []);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleButtonClick = (formType: string, action: string) => {
    console.log(`Button clicked for ${formType} - ${action}`);
    
    // EXACT Angular logic from goToApplicationForm() function
    if (action === 'New') {
      if (formType === 'Contractor Registration') {
        // Angular: if (this.contractorApplicationDetails.length > 0 && applicationType == 6)
        if (contractorAppsExist) {
          ToastService.error('Contractor registration application has already been saved as draft.');
          console.log('🚫 [APPLICATION-FORM] Contractor application already exists, preventing navigation');
          return;
        }
        
        // Navigate to contractor form (Angular parity)
        sessionStorage.setItem('allowContractorDetailsNavigation', 'true');
        console.log('✅ [APPLICATION-FORM] No existing contractor app, allowing navigation');
        navigate('/dashboard/ProjectDetails/applicationForm/contractor-applicant-details');
        
      } else if (formType === 'Supervisor Registration') {
        // Angular: if (this.supervisorApplicationDetails.length > 0 && applicationType == 7)
        if (supervisorAppsExist) {
          ToastService.error('Supervisor registration application has already been saved as draft.');
          console.log('🚫 [APPLICATION-FORM] Supervisor application already exists, preventing navigation');
          return;
        }
        
        sessionStorage.setItem('allowSupervisorRegistrationNavigation', 'true');
        console.log('✅ [APPLICATION-FORM] No existing supervisor app, allowing navigation');
        navigate('/dashboard/ProjectDetails/applicationForm/supervisor-registration');
        
      } else if (formType === 'Wireman Registration') {
        // Angular: if (this.wiremanApplicationDetails.length > 0 && applicationType == 8)
        if (wiremanAppsExist) {
          ToastService.error('Wireman registration application has already been saved as draft.');
          console.log('🚫 [APPLICATION-FORM] Wireman application already exists, preventing navigation');
          return;
        }
        
        // Note: Using wireman route for now (update route as needed)
        sessionStorage.setItem('allowWiremanRegistrationNavigation', 'true');
        console.log('✅ [APPLICATION-FORM] No existing wireman app, allowing navigation');
        navigate('/dashboard/ProjectDetails/applicationForm/wireman-information-new');
      }
    } else if (formType === 'Contractor Renewal' && action === 'Renew') {
      sessionStorage.setItem('allowContractorRenewalNavigation', 'true');
      console.log('ApplicationForm - Set allowContractorRenewalNavigation flag');
      navigate('/dashboard/ProjectDetails/applicationForm/wireman-information-new');
    }
  };

  const formData = [
    {
      formType: 'Contractor Registration',
      action: 'New',
      buttonVariant: 'primary',
      applicationType: 6
    },
    {
      formType: 'Contractor Renewal',
      action: 'Renew',
      buttonVariant: 'primary',
      applicationType: 6
    },
    {
      formType: 'Supervisor Registration',
      action: 'New',
      buttonVariant: 'primary',
      applicationType: 7
    },
    {
      formType: 'Supervisor Renewal',
      action: 'Renew',
      buttonVariant: 'primary',
      applicationType: 7
    },
    {
      formType: 'Wireman Registration',
      action: 'New',
      buttonVariant: 'primary',
      applicationType: 8
    }
  ];

  // Helper function to determine if button should be disabled (Angular parity)
  const isButtonDisabled = (formType: string, action: string): boolean => {
    if (availabilityLoading) return true; // Disable while loading
    
    if (action === 'New') {
      switch (formType) {
        case 'Contractor Registration':
          return contractorAppsExist;
        case 'Supervisor Registration':
          return supervisorAppsExist;
        case 'Wireman Registration':
          return wiremanAppsExist;
        default:
          return false;
      }
    }
    
    return false; // Renewal actions are not disabled by existing applications
  };

  return (
    <div className="min-vh-100 bg-light py-4" style={{ marginTop: '60px' }}>
      <Container fluid className="px-0" style={{ maxWidth: '1400px' }}>
        <div className="bg-white rounded shadow-sm mx-auto" style={{ width: '90%', maxWidth: '1400px', padding: '50px 60px' }}>
          
          {}
          <Row className="mb-1">
            <Col>
              <Button 
                variant="outline-secondary" 
                onClick={handleBackClick}
                className="d-flex align-items-center"
                style={{ 
                  border: '1px solid #adb5bd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '400',
                  padding: '8px 16px',
                  color: 'black',
                }}
              >
                <i className="bi bi-arrow-left me-2" style={{ fontSize: '12px' }}></i>
                Back
              </Button>
            </Col>
          </Row>

          {}
          <Row className="mb-1">
            <Col className="text-center">
              <h2 
                className="fw-normal mb-0" 
                style={{ 
                  color: '#5B9BD5', 
                  fontSize: '32px',
                  fontWeight: '400',
                  letterSpacing: '0.5px'
                }}
              >
                Application Forms
              </h2>
            </Col>
          </Row>

          {}
          <Row>
            <Col>
              <div className="table-responsive">
                <table className="table mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                  <thead>
                    <tr>
                      <th 
                        className="text-uppercase fw-bold"
                        style={{ 
                          fontSize: '16px',
                          color: '#4c4c4c ',
                          letterSpacing: '1px',
                          fontWeight: '800',
                          paddingLeft: '24px',
                          paddingRight: '24px',
                          paddingTop: '20px',
                          paddingBottom: '20px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          width: '70%'
                        }}
                      >
                        Select a Form
                      </th>
                      <th 
                        className="text-uppercase fw-bold text-end"
                        style={{ 
                          fontSize: '12px',
                          color: '#8B8B8B',
                          letterSpacing: '1px',
                          paddingLeft: '24px',
                          paddingRight: '24px',
                          paddingTop: '20px',
                          paddingBottom: '20px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          width: '30%'
                        }}
                      >
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.map((item, index) => {
                      const isEven = index % 2 === 0;
                      const bgColor = isEven ? '#ebebebcc' : '#FFFFFF';
                      
                      return (
                        <tr key={index}>
                          <td 
                            style={{ 
                              fontSize: '15px',
                              fontWeight: '500',
                              color: '#333333',
                              paddingLeft: '24px',
                              paddingRight: '24px',
                              paddingTop: '18px',
                              paddingBottom: '18px',
                              border: 'none',
                              lineHeight: '1.4',
                              backgroundColor: bgColor
                            }}
                          >
                            {item.formType}
                          </td>
                          <td 
                            className="text-end"
                            style={{ 
                              paddingLeft: '24px',
                              paddingRight: '24px',
                              paddingTop: '10px',
                              paddingBottom: '10px',
                              border: 'none',
                              backgroundColor: bgColor
                            }}
                          >
                            <Button
                              variant="primary"
                              className="fw-medium"
                              disabled={isButtonDisabled(item.formType, item.action)}
                              onClick={() => handleButtonClick(item.formType, item.action)}
                              style={{
                                fontSize: '13px',
                                fontWeight: '500',
                                borderRadius: '4px',
                                padding: '8px 20px',
                                backgroundColor: isButtonDisabled(item.formType, item.action) ? '#6c757d' : '#007BFF',
                                borderColor: isButtonDisabled(item.formType, item.action) ? '#6c757d' : '#007BFF',
                                minWidth: '100px',
                                boxShadow: 'none',
                                cursor: isButtonDisabled(item.formType, item.action) ? 'not-allowed' : 'pointer',
                                opacity: isButtonDisabled(item.formType, item.action) ? 0.6 : 1
                              }}
                              title={isButtonDisabled(item.formType, item.action) ? 
                                'Application already exists for this project site' : 
                                `Create new ${item.formType.toLowerCase()}`
                              }
                            >
                              {availabilityLoading ? 'Loading...' : item.action}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
        </div>
      </Container>

      <style>{`
        /* Apply global font family */
        * {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }

        /* Enhanced Background */
        .min-vh-100 {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
          min-height: 100vh;
        }

        /* Main Container Styling */
        .bg-white.rounded.shadow-sm {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
          border-radius: 20px !important;
          transition: all 0.3s ease;
        }

        .bg-white.rounded.shadow-sm:hover {
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15) !important;
        }

        /* Page Title Enhancement */
        h2 {
          background: linear-gradient(135deg, #5B9BD5 0%, #4A90C2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          font-weight: 600 !important;
          position: relative;
        }

        h2::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(135deg, #5B9BD5 0%, #4A90C2 100%);
          border-radius: 2px;
        }
        
        /* Enhanced Table Styling */
        .table {
          border-collapse: separate !important;
          border-spacing: 0 !important;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
        }
        
        .table th {
          font-weight: 700 !important;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
          color: #495057;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: none !important;
          position: relative;
        }

        .table th::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(135deg, #5B9BD5 0%, #4A90C2 100%);
        }
        
        .table td {
          vertical-align: middle !important;
          border: none !important;
          transition: all 0.3s ease;
          position: relative;
        }

        .table tbody tr {
          transition: all 0.3s ease;
        }

        .table tbody tr:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .table tbody tr:nth-child(even) td {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
        }
        
        .table tbody tr:nth-child(odd) td {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
        }

        /* Enhanced Button Styling */
        .btn-primary {
          background: linear-gradient(135deg, #007BFF 0%, #0056B3 100%) !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          letter-spacing: 0.5px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3) !important;
          position: relative;
          overflow: hidden;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .btn-primary:hover::before {
          left: 100%;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #0056B3 0%, #004085 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 123, 255, 0.4) !important;
        }

        .btn-primary:active {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3) !important;
        }
        
        .btn-primary:focus {
          background: linear-gradient(135deg, #0056B3 0%, #004085 100%) !important;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25), 0 8px 20px rgba(0, 123, 255, 0.4) !important;
        }
        
        /* Enhanced Back Button */
        .btn-outline-secondary {
          color: #495057 !important;
          border: 2px solid #e9ecef !important;
          background: rgba(255, 255, 255, 0.8) !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
        }
        
        .btn-outline-secondary:hover {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
          border-color: #5B9BD5 !important;
          color: #5B9BD5 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .btn-outline-secondary:focus,
        .btn-outline-secondary:active {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
          border-color: #5B9BD5 !important;
          color: #5B9BD5 !important;
          box-shadow: 0 0 0 0.2rem rgba(91, 155, 213, 0.25) !important;
        }

        /* Form Type Text Enhancement */
        .table tbody td:first-child {
          font-weight: 600 !important;
          color: #343a40 !important;
          position: relative;
        }

        .table tbody td:first-child::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 50%;
          background: linear-gradient(135deg, #5B9BD5 0%, #4A90C2 100%);
          border-radius: 2px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .table tbody tr:hover td:first-child::before {
          opacity: 1;
        }
        
        /* General Enhancements */
        .bg-white {
          background-color: #FFFFFF !important;
        }
        
        .shadow-sm {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
        }

        .table > tbody > tr > td,
        .table > thead > tr > th {
          border-top: none !important;
          border-bottom: none !important;
          border-left: none !important;
          border-right: none !important;
        }

        /* Icon Enhancement */
        .bi-arrow-left {
          transition: transform 0.3s ease;
        }

        .btn-outline-secondary:hover .bi-arrow-left {
          transform: translateX(-2px);
        }

        /* Loading States */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .loading {
          animation: pulse 1.5s infinite;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .container-fluid {
            padding: 0 8px !important;
          }
          
          .bg-white.rounded.shadow-sm {
            margin: 8px !important;
            border-radius: 16px !important;
            padding: 24px 16px !important;
            width: calc(100% - 16px) !important;
          }
          
          .table th,
          .table td {
            padding: 12px 12px !important;
            font-size: 13px !important;
          }
          
          h2 {
            font-size: 26px !important;
          }
          
          .btn {
            font-size: 12px !important;
            padding: 8px 16px !important;
          }

          .table tbody tr:hover {
            transform: none;
          }
        }
        
        @media (max-width: 576px) {
          .bg-white.rounded.shadow-sm {
            margin: 4px !important;
            border-radius: 12px !important;
            padding: 16px 12px !important;
            width: calc(100% - 8px) !important;
          }
          
          .table th,
          .table td {
            padding: 10px 8px !important;
            font-size: 12px !important;
          }
          
          h2 {
            font-size: 22px !important;
          }

          .btn {
            font-size: 11px !important;
            padding: 6px 12px !important;
          }
        }

        /* Accessibility Enhancements */
        @media (prefers-reduced-motion: reduce) {
          .btn-primary,
          .btn-outline-secondary,
          .table tbody tr,
          .table td {
            transition: none !important;
          }
          
          .table tbody tr:hover {
            transform: none !important;
          }
        }

        /* Focus States */
        .btn:focus {
          outline: 2px solid #5B9BD5;
          outline-offset: 2px;
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .btn-primary {
            background: #0056B3 !important;
            border: 2px solid #000 !important;
          }
          
          .table {
            border: 2px solid #000 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ApplicationForm;
