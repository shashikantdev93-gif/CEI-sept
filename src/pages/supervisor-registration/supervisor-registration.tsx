import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useProjectSiteAPI } from '../../hooks/useProjectSiteAPI';
import { AppStorageService } from '../../lib/storage';

const SupervisorRegistration: React.FC = () => {
  const navigate = useNavigate();
  const storageService = new AppStorageService();

  // ✅ ADD: Draft mode detection logic (Angular parity)
  const getDraftApplicationId = (): number | null => {
    console.log('� [SUPERVISOR-REGISTRATION] ===== IMMEDIATE DRAFT ID DETECTION =====');
    
    // Step 1: Check localStorage first (primary method - Angular parity)
    const applicationIdFromStorage = storageService.getApplicationId();
    const inspectionTypeFromStorage = storageService.getInspectionType();
    
    console.log('� [SUPERVISOR-REGISTRATION] localStorage check:', {
      ApplicationId: applicationIdFromStorage,
      InspectionType: inspectionTypeFromStorage
    });
    
    if (applicationIdFromStorage && inspectionTypeFromStorage === 'Supervisor') {
      const numericAppId = parseInt(applicationIdFromStorage);
      if (!isNaN(numericAppId) && numericAppId > 0) {
        console.log('✅ [SUPERVISOR-REGISTRATION] Draft navigation detected via localStorage:', numericAppId);
        return numericAppId;
      }
    }
    
    // Step 2: Check URL parameters as fallback
    const urlParams = new URLSearchParams(window.location.search);
    const appRefIdFromUrl = urlParams.get('appRefId') || 
                           urlParams.get('applicationId') || 
                           urlParams.get('appId') ||
                           urlParams.get('ApplicationId');
    
    console.log('� [SUPERVISOR-REGISTRATION] URL parameter check:', {
      appRefId: urlParams.get('appRefId'),
      applicationId: urlParams.get('applicationId'),
      appId: urlParams.get('appId'),
      ApplicationId: urlParams.get('ApplicationId'),
      finalValue: appRefIdFromUrl
    });
    
    if (appRefIdFromUrl) {
      const numericAppRefId = parseInt(appRefIdFromUrl);
      if (!isNaN(numericAppRefId) && numericAppRefId > 0) {
        console.log('✅ [SUPERVISOR-REGISTRATION] AppRefId found in URL parameters:', numericAppRefId);
        return numericAppRefId;
      }
    }
    
    // Step 3: Check sessionStorage as final fallback
    const allowDraftNavigation = sessionStorage.getItem('allowDraftNavigation');
    const draftData = sessionStorage.getItem('draftApplicationData');
    
    console.log('🔍 [SUPERVISOR-REGISTRATION] sessionStorage fallback check:', {
      allowDraftNavigation: allowDraftNavigation,
      draftData: !!draftData
    });
    
    if (allowDraftNavigation === 'true' && draftData) {
      try {
        const parsedData = JSON.parse(draftData);
        console.log('📊 [SUPERVISOR-REGISTRATION] Draft data parsed:', parsedData);
        
        // Only process if it's supervisor application type (7)
        if (parsedData.applicationType === 7 && parsedData.appId) {
          console.log('✅ [SUPERVISOR-REGISTRATION] Supervisor draft mode detected via sessionStorage, appId:', parsedData.appId);
          return parsedData.appId;
        }
      } catch (error) {
        console.error('❌ [SUPERVISOR-REGISTRATION] Error parsing draft data:', error);
      }
    }
    
    console.log('ℹ️ [SUPERVISOR-REGISTRATION] No supervisor draft detected - creating new application');
    return null;
  };

  // ✅ Get draft ID before hook initialization
  const draftApplicationId = getDraftApplicationId();
  
  // ✅ ADD: Form mode state for field disable logic (Angular parity)
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'draft'>('new');
  
  // ✅ ADD: Date formatting function for mm/dd/yyyy display format
  const formatDateOfBirth = (dateValue: string): string => {
    try {
      console.log('🔍 [DOB-FORMAT] Input date value:', dateValue);
      
      // Parse ISO date string manually to avoid auto-correction of invalid dates
      // Expected format: "1988-02-29T18:30:00Z" or "1988-02-29"
      const dateMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
      
      if (!dateMatch) {
        console.warn('⚠️ [DOB-FORMAT] Invalid date format:', dateValue);
        return '';
      }
      
      const year = dateMatch[1];
      const month = dateMatch[2];
      const day = dateMatch[3];
      
      // Format to mm/dd/yyyy directly from parsed components
      const formattedDate = `${month}/${day}/${year}`;
      
      console.log('✅ [DOB-FORMAT] Formatted date (manual parsing):', formattedDate);
      return formattedDate;
    } catch (error) {
      console.error('❌ [DOB-FORMAT] Error formatting date:', error);
      return '';
    }
  };
  
  // ✅ ADD: Project Site API integration for loading existing data
  const {
    loadProjectSiteDetails
  } = useProjectSiteAPI({
    pageType: 'applicationForm',
    autoLoad: false, // We'll load manually when needed
    onDataLoaded: (data) => {
      console.log('🎯 [SUPERVISOR-REGISTRATION] Project site data loaded, extracting supervisor data...');
      console.log('📊 [SUPERVISOR-REGISTRATION] Full API response:', data);
      
      // ✅ DEBUG: Log the structure of the response to understand data paths
      if (data) {
        console.log('🔍 [SUPERVISOR-REGISTRATION] API response structure:', Object.keys(data));
        if (data.users) {
          console.log('🔍 [SUPERVISOR-REGISTRATION] Users structure:', Object.keys(data.users));
          if (data.users.userProfileMapping) {
            console.log('🔍 [SUPERVISOR-REGISTRATION] userProfileMapping structure:', Object.keys(data.users.userProfileMapping));
          }
        }
      }
      
      // ✅ CONTRACTOR PATTERN: Don't change formMode in onDataLoaded - it's already set correctly in useEffect
      console.log('🎯 [SUPERVISOR-REGISTRATION] onDataLoaded - draftApplicationId:', draftApplicationId);
      
      // Try to find existing supervisor application data if in draft mode
      if (draftApplicationId && data && data.applications) {
        const supervisorApplication = data.applications.find((app: any) => 
          app.applicationType === 7 && app.appId === draftApplicationId
        );
        
        if (supervisorApplication) {
          console.log('✅ [SUPERVISOR-REGISTRATION] Found supervisor application data:', supervisorApplication);
          populateFormFromAPI(supervisorApplication);
        } else {
          console.log('ℹ️ [SUPERVISOR-REGISTRATION] No existing supervisor data found - new draft');
        }
      }
      
      // ✅ COMPREHENSIVE FIELD MAPPING: Extract basic user profile data (Angular parity)
      if (data && data.users && data.users.userProfileMapping && data.users.userProfileMapping.userProfile) {
        const userProfile = data.users.userProfileMapping.userProfile as any;
        console.log('👤 [SUPERVISOR-REGISTRATION] User profile data:', userProfile);
        console.log('🔍 [SUPERVISOR-REGISTRATION] User profile keys:', Object.keys(userProfile));
        console.log('🔍 [SUPERVISOR-REGISTRATION] dateOfBirth property check:', {
          exists: 'dateOfBirth' in userProfile,
          value: userProfile.dateOfBirth,
          type: typeof userProfile.dateOfBirth
        });
        
        // Map name fields (firstName + lastName)
        if (userProfile.firstName && userProfile.lastName) {
          const fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim();
          setName(fullName);
          console.log('✅ [SUPERVISOR-REGISTRATION] Name auto-filled:', fullName);
        }
        
        // Map father name
        if (userProfile.fatherName) {
          setFatherName(userProfile.fatherName);
          console.log('✅ [SUPERVISOR-REGISTRATION] Father name auto-filled:', userProfile.fatherName);
        }
        
        // Map mobile number
        if (userProfile.mobileNo) {
          setMobileNumber(userProfile.mobileNo);
          console.log('✅ [SUPERVISOR-REGISTRATION] Mobile auto-filled:', userProfile.mobileNo);
        }
        
        // Map email address
        if (userProfile.email) {
          setEmail(userProfile.email);
          console.log('✅ [SUPERVISOR-REGISTRATION] Email auto-filled:', userProfile.email);
        }
        
        // Map date of birth - API format: "1988-02-29T18:30:00Z"
        if (userProfile.dateOfBirth) {
          console.log('🔍 [SUPERVISOR-REGISTRATION] Raw dateOfBirth from API:', userProfile.dateOfBirth);
          const formattedDate = formatDateOfBirth(userProfile.dateOfBirth);
          if (formattedDate) {
            setDateOfBirth(formattedDate);
            console.log('✅ [SUPERVISOR-REGISTRATION] Date of birth auto-filled (mm/dd/yyyy):', formattedDate);
          }
        }
      }
      
      // ✅ Map address from project site data (Angular parity: address1 + address2)
      if (data && data.address1) {
        let fullAddress = data.address1;
        if (data.address2 && data.address2 !== 'N/A') {
          fullAddress += ` ${data.address2}`;
        }
        setAddress(fullAddress);
        console.log('✅ [SUPERVISOR-REGISTRATION] Address auto-filled:', fullAddress);
      }
      
      // ✅ Map PAN number from project site data (Angular parity)
      if (data && data.applicantPanNumber) {
        setPanNo(data.applicantPanNumber);
        console.log('✅ [SUPERVISOR-REGISTRATION] PAN auto-filled from projectSiteData:', data.applicantPanNumber);
      }
      
      console.log('🎯 [SUPERVISOR-REGISTRATION] All field mapping completed successfully');
    },
    onError: (error) => {
      console.error('❌ [SUPERVISOR-REGISTRATION] Error loading project site data:', error);
    }
  });

  // ✅ ADD: Function to populate form from API data (supervisor-specific fields)
  const populateFormFromAPI = (supervisorApplication: any) => {
    console.log('🔧 [SUPERVISOR-REGISTRATION] Populating supervisor-specific fields...');
    console.log('📊 [SUPERVISOR-REGISTRATION] Supervisor application data:', supervisorApplication);
    
    // Map supervisor-specific fields from API response (Angular parity)
    if (supervisorApplication.supervisorLicence_GeneralDetails) {
      const supervisorDetails = supervisorApplication.supervisorLicence_GeneralDetails;
      console.log('📋 [SUPERVISOR-REGISTRATION] Supervisor licence details:', supervisorDetails);
      
      // Map "Do you hold supervisor licence from other state" field
      if (supervisorDetails.doYouHoldSupervisorLicence !== undefined) {
        setHasCertificateFromOtherState(supervisorDetails.doYouHoldSupervisorLicence ? "Yes" : "No");
        console.log('✅ [SUPERVISOR-REGISTRATION] Supervisor licence status auto-filled:', supervisorDetails.doYouHoldSupervisorLicence);
      }
      
      // Map "Practical Experience Type" field
      if (supervisorDetails.practicleExperianceType !== undefined) {
        // Map numeric practicleExperianceType to radio button values
        const experienceTypeMap = {
          1: "two_years_electrician",
          2: "one_year_contractor", 
          3: "one_year_pwd",
          4: "one_year_instructor",
          5: "one_year_administration"
        };
        
        const experienceValue = experienceTypeMap[supervisorDetails.practicleExperianceType as keyof typeof experienceTypeMap];
        if (experienceValue) {
          setSelectedExperience(experienceValue);
          console.log('✅ [SUPERVISOR-REGISTRATION] Experience type auto-filled:', `${supervisorDetails.practicleExperianceType} -> ${experienceValue}`);
        }
      }
    }
    
    // Keep form mode as draft (don't change to edit)
    console.log('🎯 [SUPERVISOR-REGISTRATION] Supervisor data populated successfully, form mode remains:', formMode);
  };

  // ✅ CONTRACTOR PATTERN: Simple effect for draft data loading
  useEffect(() => {
    if (draftApplicationId) {
      console.log('🔄 [SUPERVISOR-REGISTRATION] Draft mode detected, loading project site data...');
      console.log('🔄 [SUPERVISOR-REGISTRATION] Draft Application ID:', draftApplicationId);
      setFormMode('draft');
      loadProjectSiteDetails();
    } else {
      console.log('ℹ️ [SUPERVISOR-REGISTRATION] No draft data found - creating new application');
      setFormMode('new');
    }
  }, [draftApplicationId, loadProjectSiteDetails]);
  
  // ✅ CONTRACTOR PATTERN: Clean up navigation flags (like Contractor)
  useEffect(() => {
    sessionStorage.removeItem('allowSupervisorRegistrationNavigation');
    return () => {
      sessionStorage.removeItem('allowSupervisorRegistrationNavigation');
    };
  }, []);

  // ✅ DEBUG: Track formMode changes
  useEffect(() => {
    console.log('🔄 [SUPERVISOR-REGISTRATION] Form mode changed to:', formMode);
    console.log('🔄 [SUPERVISOR-REGISTRATION] Fields should be disabled:', formMode === 'draft');
  }, [formMode]);


  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [panNo, setPanNo] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [hasCertificateFromOtherState, setHasCertificateFromOtherState] = useState("No");
  const [selectedExperience, setSelectedExperience] = useState("");


  const handleBack = () => {
    navigate(-1);
  };


  const handleSaveAndNext = () => {

    console.log('Saving supervisor registration and proceeding to next step...');
    

    sessionStorage.setItem('allowUploadSupervisorDocumentNavigation', 'true');
    console.log('SupervisorRegistration - Set allowUploadSupervisorDocumentNavigation flag');
    

    navigate('/dashboard/ProjectDetails/applicationForm/supervisor-registration/upload-supervisor-document');
  };

  const steps = [
    { number: 1, icon: "bi-person", title: "Supervisor Information", active: true },
    
    { number: 2, icon: "bi-upload", title: "Upload", active: false }
  ];

  return (
    <div className="supervisor-form-container min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
      <Container fluid className="px-0" style={{ maxWidth: '1400px' }}>
        
        {/* Header Card */}
        <Card className="border-0 shadow-sm mb-1 mx-auto" style={{ width: '100%',padding:'5px' }}>
          <Card.Body className="p-1">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-semibold text-primary text-center w-100">Supervisor Information</h5>
            </div>
            <div className="border-0 shadow-sm mb-1 mt-4 mx-auto" style={{ width: '65%' }}>
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
          <Card.Body className="p-1">
            
            {/* Supervisor Information Section */}
            <div className="supervisor-details-section mb-1 p-1 bg-light border rounded">
              <div className="section-header mb-1 pb-2 border-bottom">
                <h6 className="text-primary fw-semibold mb-0">
                  <i className="bi bi-person me-2"></i>
                  Supervisor Information
                </h6>
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className={`form-control border-2${formMode === 'draft' ? ' bg-light' : ''}`}
                      disabled={formMode === 'draft'}
                      readOnly={formMode === 'draft'}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Father Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="Enter father's name"
                      className={`form-control border-2${formMode === 'draft' ? ' bg-light' : ''}`}
                      disabled={formMode === 'draft'}
                      readOnly={formMode === 'draft'}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">PAN NO</Form.Label>
                    <Form.Control
                      type="text"
                      value={panNo}
                      onChange={(e) => setPanNo(e.target.value)}
                      placeholder="Enter PAN number"
                      className={`form-control border-2${formMode === 'draft' ? ' bg-light' : ''}`}
                      disabled={formMode === 'draft'}
                      readOnly={formMode === 'draft'}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Date Of Birth</Form.Label>
                    <Form.Control
                      type="text"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      placeholder="mm/dd/yyyy"
                      className={`form-control border-2${formMode === 'draft' ? ' bg-light' : ''}`}
                      disabled={formMode === 'draft'}
                      readOnly={formMode === 'draft'}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter complete address"
                      className={`form-control border-2${formMode === 'draft' ? ' bg-light' : ''}`}
                      disabled={formMode === 'draft'}
                      readOnly={formMode === 'draft'}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Mobile Number</Form.Label>
                    <Form.Control
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Enter mobile number"
                      className={`form-control border-2${formMode === 'draft' ? ' bg-light' : ''}`}
                      disabled={formMode === 'draft'}
                      readOnly={formMode === 'draft'}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className={`form-control border-2${formMode === 'draft' ? ' bg-light' : ''}`}
                      disabled={formMode === 'draft'}
                      readOnly={formMode === 'draft'}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="form-label fw-semibold text-dark">Do you hold Supervisor certificate from the other state</Form.Label>
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

       
            <div className="experience-section mb-4 p-4 bg-light border rounded">
              <div className="section-header mb-4 pb-2 border-bottom">
                <h6 className="text-primary fw-semibold mb-0">
                  <i className="bi bi-briefcase me-2"></i>
                  Required Practical Experience in any of the given fields as given below
                </h6>
              </div>

              <div className="experience-content p-3 bg-white border rounded">
                <Form.Group>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-start">
                      <Form.Check
                        type="radio"
                        name="experience"
                        id="experience1"
                        value="two_years_electrician"
                        checked={selectedExperience === "two_years_electrician"}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                        className="me-3 mt-1"
                      />
                      <div className="d-flex align-items-start flex-grow-1">
                        <i className="me-2 mt-1"></i>
                        <span className="text-dark">
                          <strong>Two Years</strong> of working experience as an Electrician Incharge in factory having Electric Installation of aggregate capacity of not less than 50 KW.
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-start">
                      <Form.Check
                        type="radio"
                        name="experience"
                        id="experience2"
                        value="one_year_contractor"
                        checked={selectedExperience === "one_year_contractor"}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                        className="me-3 mt-1"
                      />
                      <div className="d-flex align-items-start flex-grow-1">
                        <i className="me-2 mt-1"></i>
                        <span className="text-dark">
                          <strong>One year</strong> of working experience with 'A' Class Government approved Electrical Contractor for rectifying common defects in Electrical & Power Installations
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-start">
                      <Form.Check
                        type="radio"
                        name="experience"
                        id="experience3"
                        value="one_year_pwd"
                        checked={selectedExperience === "one_year_pwd"}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                        className="me-3 mt-1"
                      />
                      <div className="d-flex align-items-start flex-grow-1">
                        <i className="me-2 mt-1"></i>
                        <span className="text-dark">
                          <strong>One year</strong> of working experience in Electrical branch of PWD or under the Punjab State Electricity Corporation Limited or Military Engineering service.
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-start">
                      <Form.Check
                        type="radio"
                        name="experience"
                        id="experience4"
                        value="one_year_instructor"
                        checked={selectedExperience === "one_year_instructor"}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                        className="me-3 mt-1"
                      />
                      <div className="d-flex align-items-start flex-grow-1">
                        <i className="me-2 mt-1"></i>
                        <span className="text-dark">
                          <strong>One year</strong> as an instructor (in Electrical Engineering subjects) in an institution whose Diploma or Certificates recognised for exemption from appearing in the Supervisor Examination.
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-start">
                      <Form.Check
                        type="radio"
                        name="experience"
                        id="experience5"
                        value="one_year_administration"
                        checked={selectedExperience === "one_year_administration"}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                        className="me-3 mt-1"
                      />
                      <div className="d-flex align-items-start flex-grow-1">
                        <i className="me-2 mt-1"></i>
                        <span className="text-dark">
                          <strong>One year</strong> in the administration of Electricity law in Electrical inspectorate of any State or Central Government.
                        </span>
                      </div>
                    </div>
                  </div>
                </Form.Group>
              </div>
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

        /* ✅ FONT SIZES & COLORS - CONSOLIDATED */
        .form-label {
          font-size: 0.875rem !important;
          color: #2c3e50 !important; /* Light black for labels */
        }

        .form-control,
        .form-select {
          font-size: 0.8125rem !important;
          color: #34495e !important; /* Light black for input values */
        }

        /* Radio button text */
        .experience-content span {
          font-size: 0.8125rem !important;
          color: #2c3e50 !important; /* Light black for radio text */
        }

        /* Section headers */
        .section-header h6 {
          color: #0d6efd !important; /* Keep primary blue */
        }

        /* Form placeholders */
        .form-control::placeholder {
          font-size: 0.8125rem !important;
          color: #7f8c8d !important; /* Medium gray for placeholders */
        }

        /* Button text */
        .btn {
          font-size: 0.875rem !important;
        }

        /* ✅ DISABLED FIELD STYLING - CONSOLIDATED */
        .form-control:disabled,
        .form-select:disabled {
          background-color: #f8f9fa !important;
          border-color: #dee2e6 !important;
          opacity: 0.8 !important;
          color: #0c151dff !important; /* Darker disabled text */
          cursor: not-allowed !important;
        }

        /* Red block cursor on hover for disabled fields */
        .form-control:disabled:hover,
        .form-select:disabled:hover {
          cursor: not-allowed !important;
          background-color: #f1f3f4 !important;
        }

        /* Visual feedback for disabled state */
        .form-control:disabled::placeholder {
          color: #adb5bd !important;
        }

        /* ✅ FOCUS STATES - CONSOLIDATED */
        .form-control:focus,
        .form-select:focus {
          border-color: #0d6efd !important;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
        }

        /* ✅ RADIO BUTTON STYLING - CONSOLIDATED */
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

export default SupervisorRegistration;
