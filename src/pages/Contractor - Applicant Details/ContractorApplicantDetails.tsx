import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/shared-component/DataTable';
import FileUpload from '../../components/FileUpload';
import { useContractorForm } from '../../hooks/useContractorForm';
import { 
  CONTRACTOR_TYPES, 
  VOLTAGE_TYPES, 
  RANGE_UNITS
} from '../../constants/contractor';

const ContractorApplicantDetails: React.FC = () => {
  const navigate = useNavigate();
  const [draftApplicationId, setDraftApplicationId] = useState<number | null>(null);

  const {
  // Form States
  applicant_name, setApplicantName,
  address, setAddress,
  panCardNumber, setPanCardNumber,
  contractorType,
  currentWorkingVoltage,
  signeeNameOnBehalfOfCompany, setSigneeNameOnBehalfOfCompany,
  businessEntity, setBusinessEntity,
  businessEntityAddress, setBusinessEntityAddress,
  
  // Working Area States
  workingOnDistrict,
  workingOnTehsil,
  workingAreas,
  workingAreaFormErrors,      
  
  // Instrument States
  instrument, setInstrument,
  instrumentSerialNo, setInstrumentSerialNo,
  instrumentMake, setInstrumentMake,
  instrumentRangeFrom, setInstrumentRangeFrom,
  instrumentRangeTo, setInstrumentRangeTo,
  instrumentRangeUnit, setInstrumentRangeUnit,
  instrumentDistrict,         
  instrumentTehsil,             
  instruments,
  selectedInstrumentList,
  
  // Partner States
  partnerName, setPartnerName,
  partnerEmail, setPartnerEmail,
  partnerContactNumber, setPartnerContactNumber,
  partnerPhoto,
  uploadPan,
  panNo, setPanNo,
  partners,
  partnerPhotoPreviewUrl,
  uploadPanPreviewUrl,
  
  // Application States
  isInitialLoad,
  saveSuccess, setSaveSuccess,
  saveError, setSaveError,
  isAddingWorkingArea,
  
  // Location States
  districts,
  tehsils,
  loading,
  locationErrors,
  projectSiteLoading,
  projectSiteError,
  
  // Handler Functions
  handleWorkingDistrictChange,
  handleInstrumentDistrictChange,
  handleInstrumentTehsilChange,  
  handleContractorTypeChange,
  handleCurrentWorkingVoltageChange,
  handleWorkingTehsilChange,
  handleAddWorkingArea,
  handleAddInstrument,
  handleAddPartner,
  handleDeleteWorkingArea,
  handleDeleteInstrument,
  handleDeletePartner,
  handleFileUploaded,
  
  // Refresh function for draft data
  refreshContractorData,
  
} = useContractorForm(draftApplicationId);

  // ADD: Draft mode detection
  useEffect(() => {
    const draftData = sessionStorage.getItem('draftApplicationData');
    if (draftData) {
      try {
        const parsedData = JSON.parse(draftData);
        if (parsedData.appId) {
          console.log('🔄 [CONTRACTOR-DETAILS] Draft mode detected, appId:', parsedData.appId);
          setDraftApplicationId(parsedData.appId);
        }
      } catch (error) {
        console.error('❌ [CONTRACTOR-DETAILS] Error parsing draft data:', error);
      }
    }
  }, []);

  // ADD: Trigger data refresh when draftApplicationId is set
  useEffect(() => {
    if (draftApplicationId && refreshContractorData) {
      console.log('🔄 [CONTRACTOR-DETAILS] Triggering contractor data refresh for appId:', draftApplicationId);
      refreshContractorData();
    }
  }, [draftApplicationId, refreshContractorData]);

  // ADD: Debug state changes
  React.useEffect(() => {
    console.log('🎯 [CONTRACTOR-COMPONENT] State Debug:');
    console.log('🎯 [CONTRACTOR-COMPONENT] isInitialLoad:', isInitialLoad);
    console.log('🎯 [CONTRACTOR-COMPONENT] projectSiteLoading:', projectSiteLoading);
    console.log('🎯 [CONTRACTOR-COMPONENT] applicant_name:', applicant_name);
    console.log('🎯 [CONTRACTOR-COMPONENT] address:', address);
    console.log('🎯 [CONTRACTOR-COMPONENT] panCardNumber:', panCardNumber);
    console.log('🎯 [CONTRACTOR-COMPONENT] loading.districts:', loading.districts);
  }, [isInitialLoad, projectSiteLoading, applicant_name, address, panCardNumber, loading.districts]);

  // Clean up navigation flags
  React.useEffect(() => {
    sessionStorage.removeItem('allowContractorDetailsNavigation');
    return () => {
      sessionStorage.removeItem('allowContractorDetailsNavigation');
    };
  }, []);

  React.useEffect(() => {
  if (saveSuccess) {
    const timer = setTimeout(() => {
      setSaveSuccess(null);
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [saveSuccess, setSaveSuccess]);

// Auto-hide error messages after 8 seconds (OPTIONAL - ADD THIS TOO)
  React.useEffect(() => {
    if (saveError) {
      const timer = setTimeout(() => {
        setSaveError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [saveError, setSaveError]);

  const handleBack = () => navigate(-1);

  const handleSaveAndNext = () => {
    console.log('Saving and proceeding to next step...');
  };

  const steps = [
    { number: 1, icon: "bi-person", title: "Applicant Details", active: true },
    { number: 2, icon: "bi-check-circle", title: "Step 2", active: false },
    { number: 3, icon: "bi-file-text", title: "Step 3", active: false },
    { number: 4, icon: "bi-upload", title: "Step 4", active: false },
    { number: 5, icon: "bi-list-ul", title: "Step 5", active: false }
  ];

  // Check if contractor type requires business entity fields
  const showBusinessEntityFields = contractorType && contractorType !== "Individual";
  const showPartnerSection = contractorType && contractorType !== "Individual";

  // Show initial loading screen while fetching user data
  if (isInitialLoad || projectSiteLoading) {
    return (
      <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center" style={{ paddingTop: '80px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-primary mb-2">Loading Applicant Details</h5>
          <p className="text-muted">Fetching your profile information...</p>
          <div className="d-flex justify-content-center align-items-center mt-3">
            <div className="spinner-grow spinner-grow-sm text-primary me-2"></div>
            <small className="text-muted">Please wait while we load your data</small>
          </div>
        </div>
      </div>
    );
  }

  // Show warning if project site data failed but allow manual entry
  if (projectSiteError && !applicant_name && !address && !panCardNumber) {
    return (
      <div className="alert alert-warning m-4" role="alert">
        <h6 className="alert-heading">Unable to Load Profile Data</h6>
        <p className="mb-0">{projectSiteError}</p>
        <hr />
        <p className="mb-0">You can still fill the form manually.</p>
      </div>
    );
  }

  return (
    <div className="contractor-form-container min-vh-100" style={{ paddingTop: '80px', paddingBottom: '2px', backgroundColor: '#f8f9fa' }}>
      <Container fluid className="px-0" style={{ maxWidth: '1400px' }}>
        
        {/* Header Card */}
        <Card className="border-0 shadow-sm mb-1 mt-2 mx-auto" style={{ width: '100%' }}>
          <Card.Body className="p-1">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-semibold text-primary text-center w-100">Contractor - Applicant Details</h5>
            </div>
          
            {/* Progress Steps */}
            <div className="border-0 shadow-sm mb-1 mt-4 mx-auto" style={{ width: '100%' }}>
              <div className="p-1">
                <div className="d-flex justify-content-between align-items-center position-relative">
                  <div className="position-absolute w-100" style={{ height: '1px', backgroundColor: '#000000', top: '50%', zIndex: 1 }}></div>
                  <div className="position-absolute" style={{ height: '4px', backgroundColor: '#007bff', width: '25%', top: '50%', zIndex: 2, transition: 'width 0.3s ease' }}></div>
                  
                  {steps.map((step) => (
                    <div key={step.number} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 3 }}>
                      <div 
                        className={`rounded-circle d-flex align-items-center justify-content-center ${step.active ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                        style={{ width: '40px', height: '40px', fontSize: '14px',border: step.active ? 'none' : '1px solid #000000'  }}
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

        {/* Main Form Card */}
        <Card className="border-4 shadow-xl mx-auto" style={{ width: '100%', marginBottom: '2rem' }}>
          <Card.Body className="p-4">
            
            {/* API Save Status Display */}
            {(saveSuccess || saveError) && (
              <div className={`alert ${saveSuccess ? 'alert-success' : 'alert-danger'} d-flex align-items-center mb-4`} role="alert">
                <i className={`bi ${saveSuccess ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                <div className="flex-grow-1">
                  {saveSuccess || saveError}
                </div>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => {
                    setSaveSuccess(null);
                    setSaveError(null);
                  }}
                >
                  <i className="bi bi-x"></i>
                </Button>
              </div>
            )}

            
            
            

            {/* Location Errors Display */}
            {(locationErrors.districts || locationErrors.tehsils) && (
              <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div className="flex-grow-1">
                  <strong>Notice:</strong> {locationErrors.districts || locationErrors.tehsils}
                </div>
              </div>
            )}
            
            {/* Applicant Details Section */}
            <div className="applicant-details-section mb-5 border-3 shadow-xl">
              <div className="section-header mb-4">
                <h6 className="text-primary fw-semibold mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  Applicant Details
                  {loading.districts && (
                    <Spinner animation="border" size="sm" className="ms-2" />
                  )}
                </h6>
              </div>

              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium small">
                      Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={applicant_name}                    // FIXED: Use correct field name
                      onChange={(e) => setApplicantName(e.target.value)}  // FIXED: Use correct setter
                      placeholder="Enter applicant name"
                      className="form-control-custom"
                      disabled={true}
                      readOnly={true}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium small">
                      Address <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter address"
                      className="form-control-custom"
                      disabled={true}
                      readOnly={true}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium small">
                      PAN Number <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={panCardNumber}                     // FIXED: Use correct field name
                      onChange={(e) => setPanCardNumber(e.target.value)}  // FIXED: Use correct setter
                      placeholder="Enter PAN number"
                      className="form-control-custom"
                      disabled={true}
                      readOnly={true}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium small">
                      Contractor Type <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={contractorType}
                      onChange={(e) => handleContractorTypeChange(e.target.value)}
                      className="form-control-custom"
                    >
                      <option value="">-select-</option>
                      {CONTRACTOR_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium small">
                      Current Working Voltage <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={currentWorkingVoltage}
                      onChange={(e) => handleCurrentWorkingVoltageChange(e.target.value)}
                      className="form-control-custom"
                    >
                      <option value="">-select-</option>
                      {VOLTAGE_TYPES.map((voltage) => (
                        <option key={voltage} value={voltage}>{voltage}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                {/* Show Signee field only if contractor type is not Individual */}
                {showBusinessEntityFields && (
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">
                        Name of the Signee (On Company's behalf) <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={signeeNameOnBehalfOfCompany}
                        onChange={(e) => setSigneeNameOnBehalfOfCompany(e.target.value)}
                        placeholder="Name of the Signee (On Company's behalf)"
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>
                )}
              </Row>

              {/* Conditional Business Entity Fields */}
              {showBusinessEntityFields && (
                <Row className="g-3 mt-2">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">
                        Business Entity <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={businessEntity}
                        onChange={(e) => setBusinessEntity(e.target.value)}
                        placeholder="Business Entity"
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">
                        Business Entity Address <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={businessEntityAddress}
                        onChange={(e) => setBusinessEntityAddress(e.target.value)}
                        placeholder="Business Entity Address"
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              <Row className="g-3 mt-2">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium small">
                      Working On District <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={workingOnDistrict}
                      onChange={handleWorkingDistrictChange}
                      className="form-control-custom"
                      disabled={loading.districts}
                    >
                      <option value="">-Select District-</option>
                      {districts.map((districtItem, idx) => (
                        <option key={`${districtItem.districtCode}-${idx}`} value={districtItem.districtCode}>
                          {districtItem.districtName}
                        </option>
                      ))}
                    </Form.Select>
                    <div className="d-flex align-items-center mt-1">
                      {loading.districts && (
                        <Spinner animation="border" size="sm" className="me-2" />
                      )}
                      <div className="text-danger" style={{ fontSize: '12px' }}>
                        {workingAreaFormErrors.district || locationErrors.districts}
                      </div>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium small">
                      Working On Tehsil <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={workingOnTehsil}
                      onChange={handleWorkingTehsilChange}
                      className="form-control-custom"
                      disabled={loading.tehsils || !workingOnDistrict}
                    >
                      <option value="">-Select Tehsil-</option>
                      {!loading.tehsils && tehsils.length === 0 && workingOnDistrict && (
                        <option value="" disabled>
                          No tehsils found for this district
                        </option>
                      )}
                      {tehsils.map((tehsilItem, idx) => (
                        <option key={`${tehsilItem.tehsilId}-${idx}`} value={tehsilItem.tehsilId}>
                          {tehsilItem.tehsilName}
                        </option>
                      ))}
                    </Form.Select>
                    <div className="d-flex align-items-center mt-1">
                      {loading.tehsils && (
                        <Spinner animation="border" size="sm" className="me-2" />
                      )}
                      <div className="text-danger" style={{ fontSize: '12px' }}>
                        {workingAreaFormErrors.tehsil || locationErrors.tehsils}
                      </div>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <button 
                    onClick={handleAddWorkingArea}
                    disabled={
                      loading.districts || 
                      loading.tehsils || 
                      isAddingWorkingArea ||
                      !workingOnDistrict || 
                      !workingOnTehsil
                    }
                    className="btn btn-primary"
                    style={{
                      fontSize: '12px',
                      borderRadius: '0px !important',
                      minWidth: '160px', // Prevent button size changes
                      position: 'relative'
                    }}
                  >
                    {isAddingWorkingArea ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-plus" style={{ fontSize: '18px' }}></i> &nbsp; Add Working Area
                      </>
                    )}
                  </button>
                </Col>
              </Row>

              

              <div className="mt-4">
                <DataTable
                  title="Working Areas"
                  columns={['S.No.', 'District', 'Tehsil', 'Action']}
                  rows={workingAreas.map((area, index) => ({
                    'S.No.': index + 1,
                    District: area.district,
                    Tehsil: area.tehsil,
                    Action: 'Delete',
                    id: area.id
                  }))}
                  isMobileView={false}
                  onActionClick={(row) => handleDeleteWorkingArea(row.id)}
                  actionButton={{
                    label: 'Delete',
                    icon: 'bi-trash3',
                    variant: 'danger'
                  }}
                />
              </div>
            </div>

            {/* Partner/Shareholder Details Section - Conditional */}
            {showPartnerSection && (
              <div className="partner-details-section mb-5 border-3 shadow-xl">
                <div className="section-header mb-4">
                  <h6 className="text-primary fw-semibold mb-0">
                    <i className="bi bi-people-fill me-2"></i>
                    Partner/Shareholder Details
                  </h6>
                </div>

                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">
                        Partner Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="Enter Partner Name"
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">
                        Partner Email <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="email"
                        value={partnerEmail}
                        onChange={(e) => setPartnerEmail(e.target.value)}
                        placeholder="Enter Partner Email"
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">
                        Partner Contact Number <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={partnerContactNumber}
                        onChange={(e) => setPartnerContactNumber(e.target.value)}
                        placeholder="Enter Partner Contact No"
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mt-2">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">
                        Upload Partner Photo{" "}
                        <span className="text-muted">(in 'jpg' format less than 1MB)</span>{" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <FileUpload
                        name="partnerPhoto"
                        allowedFileTypes=".jpg,.jpeg"
                        onFileUploaded={handleFileUploaded}
                        error=""
                      />
                      {partnerPhotoPreviewUrl && (
                        <div className="mt-2">
                          <img 
                            src={partnerPhotoPreviewUrl}
                            alt="Partner Photo Preview"
                            style={{ height: '80px', maxWidth: '100%', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                        </div>
                      )}
                      <div className="text-muted small mt-1">
                        {partnerPhoto || "No file chosen"}
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">
                        Upload PAN{" "}
                        <span className="text-muted">(in 'pdf/jpg' format less than 1MB)</span>{" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <FileUpload
                        name="uploadPan"
                        allowedFileTypes=".pdf,.jpg,.jpeg,.png"
                        onFileUploaded={handleFileUploaded}
                        error=""
                      />
                      {uploadPanPreviewUrl && (
                        <div className="mt-2">
                          {uploadPan.toLowerCase().includes('.pdf') ? (
                            <div className="d-flex align-items-center">
                              <i className="bi bi-file-earmark-pdf text-danger me-2" style={{ fontSize: '24px' }}></i>
                              <span className="small text-muted">PDF file uploaded</span>
                            </div>
                          ) : (
                            <img 
                              src={uploadPanPreviewUrl}
                              alt="PAN Document Preview"
                              style={{ height: '80px', maxWidth: '100%', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                          )}
                        </div>
                      )}
                      <div className="text-muted small mt-1">
                        {uploadPan || "No file chosen"}
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">
                        PAN No <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={panNo}
                        onChange={(e) => setPanNo(e.target.value)}
                        placeholder="Enter PAN No"
                        className="form-control-custom"
                        maxLength={10}
                        style={{ textTransform: 'uppercase' }}
                      />
                      <div className="text-muted small mt-1">Count: {panNo.length} / 10</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mt-3">
                  <Col className="d-flex justify-content-end">
                    <Button
                      variant="primary"
                      onClick={handleAddPartner}
                      className="btn-custom"
                      disabled={!partnerName || !partnerEmail || !partnerContactNumber || !panNo || !partnerPhoto || !uploadPan}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Partner
                    </Button>
                  </Col>
                </Row>

                {/* Partners Table */}
                <div className="mt-4">
                  <DataTable
                    title="Partners"
                    columns={[
                      'S.No.',
                      'Name',
                      'Email',
                      'Mobile Number',
                      'Photo',
                      'PAN',
                      'PAN No',
                      'Action'
                    ]}
                    rows={partners.map((partner, index) => {
                      const photoUrl = partner.photo ? `${import.meta.env.VITE_UPLOAD_URL}Uploads/Documents/TempFiles/${partner.photo.trim()}` : '';
                      const panUrl = partner.pan ? `${import.meta.env.VITE_UPLOAD_URL}Uploads/Documents/TempFiles/${partner.pan.trim()}` : '';
                      
                      return {
                        'S.No.': index + 1,
                        'Name': partner.name,
                        'Email': partner.email,
                        'Mobile Number': partner.mobileNumber,
                        'Photo': photoUrl ? (
                          <img 
                            src={photoUrl}
                            alt="Partner Photo"
                            style={{ height: '40px', width: '40px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                        ) : 'No photo',
                        'PAN': panUrl ? (
                          partner.pan.toLowerCase().includes('.pdf') ? (
                            <div className="d-flex align-items-center justify-content-center">
                              <i className="bi bi-file-earmark-pdf text-danger" style={{ fontSize: '20px' }}></i>
                            </div>
                          ) : (
                            <img 
                              src={panUrl}
                              alt="PAN Document"
                              style={{ height: '40px', width: '40px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                          )
                        ) : 'No document',
                        'PAN No': partner.panNo,
                        Action: 'Delete',
                        id: partner.id
                      };
                    })}
                    isMobileView={false}
                    onActionClick={(row) => handleDeletePartner(row.id)}
                    actionButton={{
                      label: 'Delete',
                      icon: 'bi-trash3',
                      variant: 'danger'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Instrument Details Section */}
            <div className="instrument-details-section mt-6 mb-4 border-3 shadow-xl">
              <div className="section-header mb-4">
                <h6 className="text-primary fw-semibold mb-0">
                  <i className="bi bi-tools me-2"></i>
                  Instrument Details
                </h6>
              </div>

              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium small">
                      Instrument <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={instrument}
                      onChange={(e) => setInstrument(e.target.value)}
                      className="form-control-custom"
                      disabled={selectedInstrumentList.length === 0}
                      style={{ 
                        backgroundColor: selectedInstrumentList.length === 0 ? '#f8f9fa' : '',
                        cursor: selectedInstrumentList.length === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="">
                        {selectedInstrumentList.length === 0 ? 
                          "Please select Current Working Voltage first" : 
                          "--select--"
                        }
                      </option>
                      {selectedInstrumentList.map((instrumentItem, idx) => (
                        <option key={`${instrumentItem.value}-${idx}`} value={instrumentItem.name}>
                          {instrumentItem.name}
                        </option>
                      ))}
                    </Form.Select>
                    {selectedInstrumentList.length === 0 && (
                      <div className="text-muted small mt-1">
                        <i className="bi bi-info-circle me-1"></i>
                        Select "Current Working Voltage" to enable instrument selection
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium small">
                      Instrument Serial No <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={instrumentSerialNo}
                      onChange={(e) => setInstrumentSerialNo(e.target.value)}
                      placeholder=""
                      className="form-control-custom"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium small">
                      Instrument Make <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={instrumentMake}
                      onChange={(e) => setInstrumentMake(e.target.value)}
                      placeholder=""
                      className="form-control-custom"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium small">
                      Instrument Range (from) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={instrumentRangeFrom}
                      onChange={(e) => setInstrumentRangeFrom(e.target.value)}
                      placeholder=""
                      className="form-control-custom"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium small">
                      Instrument Range (To) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={instrumentRangeTo}
                      onChange={(e) => setInstrumentRangeTo(e.target.value)}
                      placeholder=""
                      className="form-control-custom"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium small">
                      Instrument Range (Unit) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={instrumentRangeUnit}
                      onChange={(e) => setInstrumentRangeUnit(e.target.value)}
                      className="form-control-custom"
                    >
                      <option value="">--select--</option>
                      {RANGE_UNITS.map((unit) => (
                        <option key={unit.id} value={unit.value}>{unit.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium small">
                      District <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={instrumentDistrict}                 // FIXED: Use instrumentDistrict
                      onChange={handleInstrumentDistrictChange}
                      className="form-control-custom"
                      disabled={loading.districts}
                    >
                      <option value="">-Select District-</option>
                      {districts.map((districtItem, idx) => (
                        <option key={`${districtItem.districtCode}-${idx}`} value={districtItem.districtCode}>
                          {districtItem.districtName}
                        </option>
                      ))}
                    </Form.Select>
                    <div className="d-flex align-items-center mt-1">
                      {loading.districts && (
                        <Spinner animation="border" size="sm" className="me-2" />
                      )}
                      <div className="text-danger" style={{ fontSize: '12px' }}>
                        {locationErrors.districts}
                      </div>
                    </div>
                  </Form.Group>
                </Col>

                <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-medium small">
                    Tehsil <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={instrumentTehsil}                    // FIXED: Use instrumentTehsil
                    onChange={handleInstrumentTehsilChange}     // FIXED: Use proper handler
                    className="form-control-custom"
                    disabled={loading.tehsils || !instrumentDistrict}  // FIXED: Use instrumentDistrict
                  >
                    <option value="">-Select Tehsil-</option>
                    {!loading.tehsils && tehsils.length === 0 && instrumentDistrict && (
                      <option value="" disabled>
                        No tehsils found for this district
                      </option>
                    )}
                    {tehsils.map((tehsilItem, idx) => (
                      <option key={`${tehsilItem.tehsilId}-${idx}`} value={tehsilItem.tehsilId}>
                        {tehsilItem.tehsilName}
                      </option>
                    ))}
                  </Form.Select>
                  <div className="d-flex align-items-center mt-1">
                    {loading.tehsils && (
                      <Spinner animation="border" size="sm" className="me-2" />
                    )}
                    <div className="text-danger" style={{ fontSize: '12px' }}>
                      {locationErrors.tehsils}
                    </div>
                  </div>
                </Form.Group>
              </Col>

              <Col md={4} className="d-flex align-items-end">
                <Button
                  variant="primary"
                  onClick={handleAddInstrument}
                  className="btn-custom w-100"
                  style={{ height: '38px' }}
                  disabled={
                    !instrument || 
                    !instrumentSerialNo || 
                    !instrumentMake || 
                    !instrumentDistrict ||      // FIXED: Use instrumentDistrict
                    !instrumentTehsil ||        // FIXED: Use instrumentTehsil
                    selectedInstrumentList.length === 0
                  }
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Instrument
                </Button>
              </Col>
              </Row>

              {/* Instruments Table */}
              <div className="mt-4">
                <DataTable
                  title="Instruments"
                  columns={[
                    'S.No.',
                    'Instrument Type',
                    'Instrument Serial No',
                    'Instrument Make',
                    'Instrument Range',
                    'District',
                    'Tehsil',
                    'Action'
                  ]}
                  rows={instruments.map((instrument, index) => ({
                    'S.No.': index + 1,
                    'Instrument Type': instrument.instrumentType,
                    'Instrument Serial No': instrument.instrumentSerialNo,
                    'Instrument Make': instrument.instrumentMake,
                    'Instrument Range': instrument.instrumentRange,
                    'District': instrument.district,
                    'Tehsil': instrument.tehsil,
                    Action: 'Delete',
                    id: instrument.id
                  }))}
                  isMobileView={false}
                  onActionClick={(row) => handleDeleteInstrument(row.id)}
                  actionButton={{
                    label: 'Delete',
                    icon: 'bi-trash3',
                    variant: 'danger'
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-between mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={handleBack}
                className="btn-outline-custom"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveAndNext}
                className="btn-custom"
              >
                Save & Next
                <i className="bi bi-arrow-right ms-2"></i>
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Enhanced styles with API notification support */}
      <style>{`
        /* Apply global font family */
        * {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }

        .contractor-form-container {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: 100vh;
          position: relative;
        }

        .contractor-form-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.03);
          pointer-events: none;
          z-index: 0;
        }

        /* Card Enhancements */
        .card {
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .card:hover {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
        }

        /* Section Headers */
        .section-header {
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 8px;
        }

        .section-header h6 {
          color: #007bff;
          font-size: 1.1rem;
        }

        /* Form Sections */
        .applicant-details-section,
        .instrument-details-section,
        .partner-details-section {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          background: rgba(248, 249, 250, 0.4);
          position: relative;
        }

        .applicant-details-section::before,
        .instrument-details-section::before,
        .partner-details-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 6px;
          z-index: -1;
        }

        /* Form Controls */
        .form-control-custom,
        .form-select {
          border: 2px solid #dee2e6 !important;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .form-control-custom:focus,
        .form-select:focus {
          border-color: #007bff !important;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          outline: none;
        }

        /* Disabled state styling */
        .form-control-custom:disabled,
        .form-select:disabled {
          background-color: #f8f9fa !important;
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Labels */
        .form-label {
          color: #495057;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 13px;
        }

        /* Success indicators for auto-filled fields */
        .text-success {
          color: #198754 !important;
        }

        /* Alert styling */
        .alert {
          border-radius: 8px;
          border: none;
          backdrop-filter: blur(5px);
        }

        .alert-success {
          background: rgba(212, 237, 218, 0.9);
          border-color: #d1e7dd;
          color: #0a3622;
        }

        .alert-danger {
          background: rgba(248, 215, 218, 0.9);
          border-color: #f1aeb5;
          color: #58151c;
        }

        .alert-warning {
          background: rgba(255, 243, 205, 0.8);
        }

        /* Buttons */
        .btn-custom {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          padding: 8px 16px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
        }

        .btn-custom:hover {
          background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
        }

        .btn-custom:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Loading button styling */
        .btn-custom .spinner-border {
          width: 1rem;
          height: 1rem;
          border-width: 0.15em;
        }

        .btn-outline-custom {
          border: 2px solid #6c757d;
          color: #6c757d;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          padding: 8px 16px;
          transition: all 0.3s ease;
        }

        .btn-outline-custom:hover {
          background: #6c757d;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
        }

        /* Tables */
        .data-table {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(5px);
        }

        .data-table th {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: none;
          font-weight: 600;
          color: #495057;
          font-size: 12px;
          padding: 12px 8px;
          text-align: center;
        }

        .data-table td {
          border: none;
          font-size: 12px;
          padding: 10px 8px;
          text-align: center;
          vertical-align: middle;
          border-bottom: 1px solid #f1f3f4;
        }

        .data-table tbody tr:hover {
          background: rgba(0, 123, 255, 0.05);
        }

        /* Disabled instrument dropdown styling */
        .form-control-custom:disabled {
          background-color: #f8f9fa !important;
          opacity: 0.7;
          cursor: not-allowed;
          border-color: #e9ecef !important;
        }

        /* Info message styling */
        .text-muted {
          color: #6c757d !important;
          font-size: 0.875rem;
        }

        .text-muted .bi {
          font-size: 0.875rem;
        }

        /* Highlight enabled state */
        .form-control-custom:not(:disabled):focus {
          border-color: #007bff !important;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        /* Progress Steps */
        .bg-primary {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .contractor-form-container {
            padding-top: 60px !important;
          }

          .card {
            margin: 8px !important;
            width: calc(100% - 16px) !important;
          }

          .form-control-custom,
          .form-select {
            font-size: 12px;
            padding: 6px 10px;
            border: 2px solid #ced4da !important;
          }

          .btn-custom,
          .btn-outline-custom {
            font-size: 12px;
            padding: 6px 12px;
          }

          .data-table th,
          .data-table td {
            font-size: 10px;
            padding: 6px 4px;
          }

          .applicant-details-section,
          .instrument-details-section,
          .partner-details-section {
            padding: 15px;
            border-width: 2px;
          }
        }

        @media (max-width: 576px) {
          .section-header h6 {
            font-size: 1rem;
          }

          .form-label {
            font-size: 12px;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .card,
          .btn-custom,
          .btn-outline-custom,
          .form-control-custom {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ContractorApplicantDetails;