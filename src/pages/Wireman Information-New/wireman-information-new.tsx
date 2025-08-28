import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { userDetailsService } from '../../services/api/userDetailsService';
import type { ApiResponse } from '../../types/common';

const WiremanInformationNew: React.FC = () => {
  const navigate = useNavigate();

  // State for draft data and form mode
  const [draftData, setDraftData] = useState<any>(null);
  const [formMode, setFormMode] = useState<'new' | 'edit'>('new');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('🔧 [WIREMAN_COMPONENT] ===== WIREMAN COMPONENT INITIALIZED =====');
    console.log('🔧 [WIREMAN_COMPONENT] Component mounted');
    console.log('🔧 [WIREMAN_COMPONENT] Current location: /wireman-information-new');
    
    // Check if this is a draft navigation
    const allowDraftNavigation = sessionStorage.getItem('allowDraftNavigation');
    const storedDraftData = sessionStorage.getItem('draftApplicationData');
    
    console.log('🔍 [WIREMAN_COMPONENT] Checking for draft data...');
    console.log('🔍 [WIREMAN_COMPONENT] allowDraftNavigation:', allowDraftNavigation);
    console.log('🔍 [WIREMAN_COMPONENT] storedDraftData exists:', !!storedDraftData);
    
    if (allowDraftNavigation === 'true' && storedDraftData) {
      try {
        const parsedDraftData = JSON.parse(storedDraftData);
        console.log('📊 [WIREMAN_COMPONENT] Draft data parsed successfully:', parsedDraftData);
        
        setDraftData(parsedDraftData);
        setFormMode('edit');
        
        console.log('🔧 [WIREMAN_COMPONENT] Form mode set to: edit');
        console.log('🔧 [WIREMAN_COMPONENT] Draft data loaded for appId:', parsedDraftData.appId);
        
        // Load existing application data
        loadWiremanApplicationData(parsedDraftData.appId);
        
        // Clean up session storage
        sessionStorage.removeItem('allowDraftNavigation');
        console.log('🧹 [WIREMAN_COMPONENT] Cleaned up navigation flag');
        
      } catch (error) {
        console.error('❌ [WIREMAN_COMPONENT] Error parsing draft data:', error);
        setFormMode('new');
      }
    } else {
      console.log('🆕 [WIREMAN_COMPONENT] No draft data found, setting form mode to: new');
      setFormMode('new');
    }
 
    console.log('WiremanInformationNew - Cleaning up navigation flags');
    sessionStorage.removeItem('allowSupervisorRegistrationNavigation');
    
    return () => {
      console.log('🧹 [WIREMAN_COMPONENT] Component cleanup');
      sessionStorage.removeItem('allowSupervisorRegistrationNavigation');
      sessionStorage.removeItem('allowDraftNavigation');
      sessionStorage.removeItem('draftApplicationData');
    };
  }, []);


  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [panNo, setPanNo] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [hasCertificateFromOtherState, setHasCertificateFromOtherState] = useState("No");

  const loadWiremanApplicationData = async (appId: number) => {
    console.log('📊 [GET_WIREMAN_APPLICATION_DETAILS] Function started');
    console.log('📊 [GET_WIREMAN_APPLICATION_DETAILS] appId:', appId);
    
    setIsLoading(true);
    
    try {
      console.log('🌐 [GET_WIREMAN_APPLICATION_DETAILS] Making API call to get wireman application details');
      console.log('🌐 [GET_WIREMAN_APPLICATION_DETAILS] Using userDetailsService.getWiremanApplication');
      console.log('🌐 [GET_WIREMAN_APPLICATION_DETAILS] Parameters:', { id: appId });
      
      const response: ApiResponse<any> = await userDetailsService.getWiremanApplication(appId);
      
      console.log('📡 [GET_WIREMAN_APPLICATION_DETAILS] API response received:', response);
      
      if (response.data) {
        const wiremanData = response.data;
        console.log('✅ [GET_WIREMAN_APPLICATION_DETAILS] Wireman data extracted:', wiremanData);
        
        // Update form fields with loaded data
        if (wiremanData.name) {
          setName(wiremanData.name);
          console.log('📊 [GET_WIREMAN_APPLICATION_DETAILS] Set name:', wiremanData.name);
        }
        if (wiremanData.fatherName) {
          setFatherName(wiremanData.fatherName);
          console.log('📊 [GET_WIREMAN_APPLICATION_DETAILS] Set father name:', wiremanData.fatherName);
        }
        if (wiremanData.panNo) {
          setPanNo(wiremanData.panNo);
          console.log('📊 [GET_WIREMAN_APPLICATION_DETAILS] Set PAN:', wiremanData.panNo);
        }
        if (wiremanData.dateOfBirth) {
          setDateOfBirth(wiremanData.dateOfBirth);
          console.log('📊 [GET_WIREMAN_APPLICATION_DETAILS] Set DOB:', wiremanData.dateOfBirth);
        }
        if (wiremanData.address) {
          setAddress(wiremanData.address);
          console.log('📊 [GET_WIREMAN_APPLICATION_DETAILS] Set address:', wiremanData.address);
        }
        if (wiremanData.mobileNumber) {
          setMobileNumber(wiremanData.mobileNumber);
          console.log('📊 [GET_WIREMAN_APPLICATION_DETAILS] Set mobile:', wiremanData.mobileNumber);
        }
        if (wiremanData.email) {
          setEmail(wiremanData.email);
          console.log('📊 [GET_WIREMAN_APPLICATION_DETAILS] Set email:', wiremanData.email);
        }
        if (wiremanData.hasCertificateFromOtherState) {
          setHasCertificateFromOtherState(wiremanData.hasCertificateFromOtherState);
          console.log('📊 [GET_WIREMAN_APPLICATION_DETAILS] Set certificate status:', wiremanData.hasCertificateFromOtherState);
        }
        
        console.log('📊 [GET_WIREMAN_APPLICATION_DETAILS] Form data updated with existing values');
        console.log('✅ [GET_WIREMAN_APPLICATION_DETAILS] Data processing completed successfully');
      } else {
        console.warn('⚠️ [GET_WIREMAN_APPLICATION_DETAILS] No data found in response');
      }
    } catch (error: any) {
      console.error('❌ [GET_WIREMAN_APPLICATION_DETAILS] Exception occurred:', error);
      console.error('❌ [GET_WIREMAN_APPLICATION_DETAILS] Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        data: error.data
      });
    } finally {
      setIsLoading(false);
      console.log('🔚 [GET_WIREMAN_APPLICATION_DETAILS] Function completed');
    }
  };


  const handleBack = () => {
    navigate(-1);
  };


  const handleSaveAndNext = () => {

    console.log('Saving supervisor registration and proceeding to next step...');
    

    sessionStorage.setItem('allowUploadSupervisorDocumentNavigation', 'true');
    console.log('SupervisorRegistration - Set allowUploadSupervisorDocumentNavigation flag');
    

    navigate('/dashboard/ProjectDetails/applicationForm/supervisor-registration/upload-wireman-document');
  };

  const steps = [
    { number: 1, icon: "bi-person", title: "Supervisor Information", active: true },
    
    { number: 2, icon: "bi-upload", title: "Upload", active: false }
  ];

  return (
    <div className="supervisor-form-container min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
      <Container fluid className="px-0" style={{ maxWidth: '1200px' }}>
        
        {/* Header Card */}
        <Card className="border-0 shadow-sm mb-1 mx-auto" style={{ width: '100%' }}>
          <Card.Body className="p-1">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-semibold text-primary text-center w-100">
                {formMode === 'edit' ? 'Edit Wireman Information (Draft)' : 'Wireman Information - New'}
                {draftData && <small className="ms-2 text-muted">({draftData.applicationId})</small>}
              </h5>
            </div>
            <div className="border-0 shadow-sm mb-1 mt-2 mx-auto" style={{ width: '55%' }}>
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
                      width: '0%',
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

 
        <Card className="border-0 shadow-sm mx-auto" style={{ width: '100%' }}>
          <Card.Body className="p-2">
            
            {/* Wireman Information - New */}
            <div className="wireman-information-section mb-4 p-4 bg-white border rounded shadow-sm">
              <Row className="g-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className="form-control border-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Father Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="Enter father's name"
                      className="form-control border-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={1}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder=""
                      className="form-control border-2"
                    />
                  </Form.Group>
                </Col>
                
              </Row>

              <Row className="g-3 mt-2">
                
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Date Of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="form-control border-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">PAN NO</Form.Label>
                    <Form.Control
                      type="text"
                      value={panNo}
                      onChange={(e) => setPanNo(e.target.value)}
                      placeholder="Enter PAN number"
                      className="form-control border-2"
                    />
                  </Form.Group>
                </Col>                
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Mobile Number</Form.Label>
                    <Form.Control
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Enter mobile number"
                      className="form-control border-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="form-control border-2"
                    />
                  </Form.Group>
                </Col>
                
                
              </Row>

              <Row className="g-3 mt-2">
                
              </Row>

              <Row className="g-3 mt-2">
                
                
              </Row>

              <Row className="g-3 mt-2">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Do you hold permit from any other state</Form.Label>
                    <Form.Select
                      value={hasCertificateFromOtherState}
                      onChange={(e) => setHasCertificateFromOtherState(e.target.value)}
                      className="form-select border-2"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
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
              <Button 
                variant="primary" 
                onClick={handleSaveAndNext}
                className="btn-primary fw-semibold"
              >
                Save & Next
                <i className="bi bi-arrow-right ms-2"></i>
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <style>{`
        .supervisor-form-container {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        /* Focus states for better accessibility */
        .form-control:focus,
        .form-select:focus {
          border-color: #0d6efd !important;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
        }

        /* Bold radio button borders */
        .form-check-input {
          border: 2px solid #6c757d !important;
          border-width: 2px !important;
        }

        .form-check-input:checked {
          background-color: #0d6efd !important;
          border-color: #0d6efd !important;
          border-width: 2px !important;
        }

        .form-check-input:focus {
          border-color: #0d6efd !important;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
          border-width: 2px !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .supervisor-form-container {
            padding-top: 60px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WiremanInformationNew;
