import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import FormField from '../../components/shared-component/FormField';
import DataTable from '../../components/shared-component/DataTable';
import LoadingButton from '../../components/shared-component/LoadingButton';
import FileUpload from '../../components/FileUpload';
import { useLocation } from '../../hooks/useLocation';
import { useContractorForm } from '../../hooks/useContractorForm';
import { useSupervisorValidation } from '../../hooks/useSupervisorValidation';
import { useSupervisorData } from '../../hooks/useSupervisorData';
import { useSupervisorPageData } from '../../hooks/contractor/useSupervisorPageData';
import { 
  transformSupervisorFormToData, 
  transformWiremanFormToData,
  formatSupervisorForTable,
  formatWiremanForTable,
  getSuccessMessage,
  getErrorMessage,
  clearFormForOnlineMode
} from '../../utils/supervisorUtils';

const ContractorSupervisor: React.FC = () => {
  const navigate = useNavigate();
  
  // Page-level data loading and management
  const {
    supervisors,
    wiremans,
    contractorData,
    totalSupervisors,
    totalWiremans,
    maxSupervisors,
    maxWiremans,
    appRefId,
    isLoading: isPageLoading,
    hasExpiredSupervisors,
    hasExpiredWiremans,
    loadData,
    refreshData,
    checkExpiryStatus
  } = useSupervisorPageData();
  
  // Application workflow integration (matches Angular supervisor component)
  const { 
    apprefId, 
    ensureApplicationExists
  } = useContractorForm();
  
  // Custom hooks for validation and data management
  const {
    supervisorForm,
    wiremanForm,
    supervisorErrors,
    wiremanErrors,
    setSupervisorForm,
    setWiremanForm,
    validateSupervisorForm,
    validateWiremanForm,
    handleSupervisorFieldChange,
    handleWiremanFieldChange,
    handleSupervisorCertificateChange,
    handleWiremanCertificateChange,
    isValidatingSupervisor,
    isValidatingWireman,
    resetSupervisorForm,
    resetWiremanForm,
    clearSupervisorOnlineErrors,
    clearWiremanOnlineErrors,
    validateField,
    workingAreaLogic
  } = useSupervisorValidation();

  const {
    supervisorsList: existingSupervisorsList,
    wiremansList: existingWiremansList,
    isAddingSupervisor,
    isAddingWireman,
    setIsAddingSupervisor,
    setIsAddingWireman,
    addSupervisor,
    addWireman,
    deleteSupervisor,
    deleteWireman
  } = useSupervisorData();

  // Use page data or fallback to local data
  const supervisorsList = supervisors.length > 0 ? supervisors : existingSupervisorsList;
  const wiremansList = wiremans.length > 0 ? wiremans : existingWiremansList;

  // Mode toggles (offline/online)
  const [isSupervisorOffline, setIsSupervisorOffline] = useState(true);
  const [isWiremanOffline, setIsWiremanOffline] = useState(true);
  
  // Loading and error states
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Location hook for districts and tehsils
  const { 
    districts, 
    tehsils, 
    loadDistricts, 
    loadTehsils, 
    resetTehsils 
  } = useLocation();

  // Load initial data
  useEffect(() => {
    // Load districts for Punjab state (ID: 3)
    loadDistricts(3);
  }, [loadDistricts]);

  // Supervisor mode change handler
  const handleSupervisorModeChange = (isOffline: boolean) => {
    setIsSupervisorOffline(isOffline);
    if (!isOffline) {
      // Clear fields that will be auto-filled for online mode
      setSupervisorForm(prev => clearFormForOnlineMode(prev));
      clearSupervisorOnlineErrors();
    }
  };

  // Wireman mode change handler
  const handleWiremanModeChange = (isOffline: boolean) => {
    setIsWiremanOffline(isOffline);
    if (!isOffline) {
      // Clear fields that will be auto-filled for online mode
      setWiremanForm(prev => clearFormForOnlineMode(prev));
      clearWiremanOnlineErrors();
    }
  };

  const handleSupervisorDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setSupervisorForm(prev => ({
      ...prev,
      districtRefId: districtId,
      tehsilRefId: ''
    }));
    validateField('districtRefId', districtId, 'supervisor');
    
    // Working area logic: Load tehsils for this district from working areas
    if (districtId) {
      const filteredTehsils = workingAreaLogic.getAllWorkingTehsils(Number(districtId));
      console.log('🏘️ [SUPERVISOR] Available working area tehsils for district', districtId, ':', filteredTehsils.length);
      // Fallback to load all tehsils if working area logic doesn't return enough
      if (filteredTehsils.length === 0) {
        loadTehsils(Number(districtId));
      }
    } else {
      resetTehsils();
    }
  };

  const handleWiremanDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setWiremanForm(prev => ({
      ...prev,
      districtRefId: districtId,
      tehsilRefId: ''
    }));
    validateField('districtRefId', districtId, 'wireman');
    
    // Working area logic: Load tehsils for this district from working areas
    if (districtId) {
      const filteredTehsils = workingAreaLogic.getAllWorkingTehsils(Number(districtId));
      console.log('🏘️ [WIREMAN] Available working area tehsils for district', districtId, ':', filteredTehsils.length);
      // Fallback to load all tehsils if working area logic doesn't return enough
      if (filteredTehsils.length === 0) {
        loadTehsils(Number(districtId));
      }
    } else {
      resetTehsils();
    }
  };

  // File upload handlers (dummy implementation)
  const handleSupervisorFileUpload = (info: { formControlName: string; serverResponse: any }) => {
    // TODO: Handle file upload for supervisor documents
    console.log('Supervisor file uploaded:', info);
  };

  const handleWiremanFileUpload = (info: { formControlName: string; serverResponse: any }) => {
    // TODO: Handle file upload for wireman documents
    console.log('Wireman file uploaded:', info);
  };

  // Add supervisor handler
  const handleAddSupervisor = async () => {
    // Validate form
    if (!validateSupervisorForm()) {
      setSaveError('Please fill all required fields correctly');
      return;
    }
    
    // Step 1.5: Check for duplicate working area (Angular parity)
    const districtRefId = Number(supervisorForm.districtRefId);
    const tehsilRefId = Number(supervisorForm.tehsilRefId);
    
    if (districtRefId && tehsilRefId) {
      const isDuplicate = workingAreaLogic.checkDuplicateSupervisor(
        districtRefId, 
        tehsilRefId, 
        supervisorsList
      );
      
      if (isDuplicate) {
        setSaveError('Oops! You had already added a supervisor for same working area');
        return;
      }
    }
    
    setIsAddingSupervisor(true);
    setSaveError(null);
    
    try {
      // Step 1: Ensure application exists (matching Angular pattern)
      let currentApprefId = apprefId;
      if (!currentApprefId || currentApprefId === 0) {
        console.log('🏗️ [SUPERVISOR] apprefId is 0, creating application details first');
        try {
          currentApprefId = await ensureApplicationExists();
          if (!currentApprefId) {
            throw new Error('Failed to create application details');
          }
        } catch (error) {
          console.error('❌ [SUPERVISOR] Error in ensureApplicationExists:', error);
          setSaveError('Failed to create application details. Please try again.');
          return;
        }
      }

      console.log('🏗️ [SUPERVISOR] Using apprefId:', currentApprefId);

      // Step 2: Transform form data to supervisor data
      const supervisorData = transformSupervisorFormToData(
        supervisorForm,
        districts,
        tehsils,
        !isSupervisorOffline,
        currentApprefId // Use the ensured apprefId
      );
      
      // Step 3: Add supervisor
      addSupervisor(supervisorData);
      
      // Step 4: Reset form and show success
      resetSupervisorForm();
      setSaveSuccess(getSuccessMessage('supervisor', 'add'));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error('❌ [SUPERVISOR] Error adding supervisor:', error);
      setSaveError(getErrorMessage('supervisor', 'add'));
    } finally {
      setIsAddingSupervisor(false);
    }
  };

  // Add wireman handler
  const handleAddWireman = async () => {
    // Validate form
    if (!validateWiremanForm()) {
      setSaveError('Please fill all required fields correctly');
      return;
    }
    
    // Step 1.5: Check for duplicate working area (Angular parity)
    const districtRefId = Number(wiremanForm.districtRefId);
    const tehsilRefId = Number(wiremanForm.tehsilRefId);
    
    if (districtRefId && tehsilRefId) {
      const isDuplicate = workingAreaLogic.checkDuplicateWireman(
        districtRefId, 
        tehsilRefId, 
        wiremansList
      );
      
      if (isDuplicate) {
        setSaveError('Oops! You had already added a wireman for same working area');
        return;
      }
    }
    
    setIsAddingWireman(true);
    setSaveError(null);
    
    try {
      // Step 1: Ensure application exists (matching Angular pattern)
      let currentApprefId = apprefId;
      if (!currentApprefId || currentApprefId === 0) {
        console.log('🏗️ [WIREMAN] apprefId is 0, creating application details first');
        try {
          currentApprefId = await ensureApplicationExists();
          if (!currentApprefId) {
            throw new Error('Failed to create application details');
          }
        } catch (error) {
          console.error('❌ [WIREMAN] Error in ensureApplicationExists:', error);
          setSaveError('Failed to create application details. Please try again.');
          return;
        }
      }

      console.log('🏗️ [WIREMAN] Using apprefId:', currentApprefId);

      // Step 2: Transform form data to wireman data
      const wiremanData = transformWiremanFormToData(
        wiremanForm,
        districts,
        tehsils,
        !isWiremanOffline,
        currentApprefId // Use the ensured apprefId
      );
      
      // Step 3: Add wireman
      addWireman(wiremanData);
      
      // Step 4: Reset form and show success
      resetWiremanForm();
      setSaveSuccess(getSuccessMessage('wireman', 'add'));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error('❌ [WIREMAN] Error adding wireman:', error);
      setSaveError(getErrorMessage('wireman', 'add'));
    } finally {
      setIsAddingWireman(false);
    }
  };

  // Delete handlers
  const handleDeleteSupervisor = (id: number) => {
    deleteSupervisor(id);
    setSaveSuccess(getSuccessMessage('supervisor', 'delete'));
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleDeleteWireman = (id: number) => {
    deleteWireman(id);
    setSaveSuccess(getSuccessMessage('wireman', 'delete'));
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // Save and Next handler (Angular parity)
  const handleSaveAndNext = () => {
    console.log('💾 [SAVE_AND_NEXT] Starting validation...');
    
    // Validate completion requirements using working area logic
    const validationResult = workingAreaLogic.validateCompletionRequirements(
      supervisorsList, 
      wiremansList
    );
    
    console.log('💾 [SAVE_AND_NEXT] Validation result:', validationResult);
    
    if (!validationResult.isValid) {
      console.log('❌ [SAVE_AND_NEXT] Validation failed:', validationResult.message);
      setSaveError(validationResult.message);
      
      // Show SweetAlert for better UX (matching Angular)
      if (validationResult.expiredLicences.supervisors.length > 0 || 
          validationResult.expiredLicences.wiremans.length > 0) {
        // Show expired licence details
        console.log('⚠️ [SAVE_AND_NEXT] Expired licences detected');
      }
      
      return;
    }
    
    console.log('✅ [SAVE_AND_NEXT] Validation passed, navigating to next page');
    setSaveSuccess('Supervisor and Wireman details saved successfully!');
    
    // Navigate to next page (matching Angular routing pattern)
    setTimeout(() => {
      navigate('/dashboard/ProjectDetails/applicationForm/attachments', {
        state: {
          apprefId,
          supervisorsList,
          wiremansList,
          workingAreaList: workingAreaLogic.workingAreaList
        }
      });
    }, 1000);
  };

  return (
    <div className="contractor-form-container min-vh-100" style={{ paddingTop: '80px', paddingBottom: '2px', backgroundColor: '#f8f9fa' }}>
      <Container fluid className="px-0" style={{ maxWidth: '1400px' }}>
        
        {/* Header Card */}
        <Card className="border-0 shadow-sm mb-1 mt-2 mx-auto" style={{ width: '100%' }}>
          <Card.Body className="p-1">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center justify-content-between w-100">
                <h5 className="mb-0 fw-semibold text-primary text-center flex-grow-1">
                  <i className="bi bi-people me-2"></i>
                  Contractor Supervisor & Wireman Details
                  {isPageLoading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
                </h5>
                
                {/* Refresh Data Button */}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={refreshData}
                  disabled={isPageLoading}
                  title="Refresh data from server"
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  {isPageLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </div>
            
            {/* Data Summary */}
            {(totalSupervisors > 0 || totalWiremans > 0) && (
              <div className="mt-2 text-center">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Current: {totalSupervisors} supervisors, {totalWiremans} wiremans
                  {maxSupervisors > 0 && ` (Max: ${maxSupervisors} supervisors, ${maxWiremans} wiremans)`}
                </small>
              </div>
            )}
          
            {/* Progress Steps */}
            <div className="border-0 shadow-sm mb-1 mt-4 mx-auto" style={{ width: '100%' }}>
              <div className="p-1">
                <div className="d-flex justify-content-between align-items-center position-relative">
                  <div className="position-absolute w-100" style={{ height: '1px', backgroundColor: '#000000', top: '50%', zIndex: 1 }}></div>
                  <div className="position-absolute" style={{ height: '4px', backgroundColor: '#007bff', width: '50%', top: '50%', zIndex: 2, transition: 'width 0.3s ease' }}></div>
                  
                  {[
                    { number: 1, icon: "bi-person", title: "Applicant Details", active: true },
                    { number: 2, icon: "bi-people", title: "Supervisor Details", active: true },
                    { number: 3, icon: "bi-file-text", title: "Step 3", active: false },
                    { number: 4, icon: "bi-upload", title: "Step 4", active: false },
                    { number: 5, icon: "bi-list-ul", title: "Step 5", active: false }
                  ].map((step) => (
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

            {/* Expiry Warnings */}
            {hasExpiredSupervisors && (
              <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Warning:</strong> Some supervisor certificates have expired. Please update them immediately.
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => checkExpiryStatus()}
                  aria-label="Refresh"
                ></button>
              </div>
            )}
            
            {hasExpiredWiremans && (
              <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Warning:</strong> Some wireman certificates have expired. Please update them immediately.
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => checkExpiryStatus()}
                  aria-label="Refresh"
                ></button>
              </div>
            )}

            {/* Success/Error Messages */}
            {saveSuccess && (
              <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                {saveSuccess}
              </div>
            )}
            
            {saveError && (
              <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {saveError}
              </div>
            )}

            {/* 1. Supervisor Details Section */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-light">
                <h6 className="mb-0 text-primary fw-semibold">
                  <i className="bi bi-person-badge me-2"></i>
                  1. Supervisor Details
                </h6>
              </Card.Header>
              <Card.Body>
                {/* Offline/Online Toggle */}
                <Row className="mb-4">
                  <Col md={12}>
                    <div className="form-check-container d-flex gap-4">
                      <Form.Check
                        type="radio"
                        id="supervisorOffline"
                        name="supervisorMode"
                        label="Offline"
                        checked={isSupervisorOffline}
                        onChange={() => handleSupervisorModeChange(true)}
                        className="form-check-custom"
                      />
                      <Form.Check
                        type="radio"
                        id="supervisorOnline"
                        name="supervisorMode"
                        label="Online"
                        checked={!isSupervisorOffline}
                        onChange={() => handleSupervisorModeChange(false)}
                        className="form-check-custom"
                      />
                    </div>
                  </Col>
                </Row>

                {/* Supervisor Form Fields */}
                <Row className="g-3">
                <Col md={4}>
                  <FormField
                    label="Appointed Supervisor"
                    type="text"
                    value={supervisorForm.fullName}
                    onChange={(value) => handleSupervisorFieldChange('fullName', value)}
                    placeholder="Enter supervisor name"
                    required
                    disabled={!isSupervisorOffline}
                    className={`form-control-custom ${supervisorErrors.fullName ? 'is-invalid' : ''}`}
                    error={supervisorErrors.fullName}
                  />
                </Col>
                
                <Col md={4}>
                  <FormField
                    label="Certificate No."
                    type="text"
                    value={supervisorForm.licenceNo}
                    onChange={(value) => {
                      handleSupervisorFieldChange('licenceNo', value);
                      // Trigger certificate validation with debounce
                      handleSupervisorCertificateChange(value, !isSupervisorOffline);
                    }}
                    placeholder="Enter certificate number"
                    required
                    className={`form-control-custom ${supervisorErrors.licenceNo ? 'is-invalid' : ''} ${isValidatingSupervisor ? 'validating' : ''}`}
                    error={supervisorErrors.licenceNo}
                    disabled={isValidatingSupervisor}
                  />
                  {isValidatingSupervisor && (
                    <div className="text-info mt-1">
                      <i className="fa fa-spinner fa-spin me-1"></i>
                      Validating certificate...
                    </div>
                  )}
                </Col>
                
                <Col md={4}>
                  <FormField
                    label="Valid up to"
                    type="date"
                    value={supervisorForm.licenceValidUpto}
                    onChange={(value) => handleSupervisorFieldChange('licenceValidUpto', value)}
                    required
                    disabled={!isSupervisorOffline}
                    className={`form-control-custom ${supervisorErrors.licenceValidUpto ? 'is-invalid' : ''}`}
                    error={supervisorErrors.licenceValidUpto}
                  />
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={4}>
                  <FormField
                    label="PAN NO"
                    type="text"
                    value={supervisorForm.panNo}
                    onChange={(value) => handleSupervisorFieldChange('panNo', value.toUpperCase())}
                    placeholder="Enter PAN number"
                    required
                    disabled={!isSupervisorOffline}
                    className={`form-control-custom ${supervisorErrors.panNo ? 'is-invalid' : ''}`}
                    error={supervisorErrors.panNo}
                  />
                </Col>
                
                <Col md={4}>
                  <label className="form-label fw-semibold">
                    Upload Supervisor Certificate *
                  </label>
                  <FileUpload
                    allowedFileTypes=".pdf,.jpg,.jpeg,.png"
                    name="uploadPan"
                    onFileUploaded={(info) => handleSupervisorFileUpload({
                      formControlName: 'supervisorCertificate',
                      serverResponse: info.serverResponse
                    })}
                  />
                </Col>
                
                <Col md={4}>
                  <label className="form-label fw-semibold">
                    Upload PAN *
                  </label>
                  <FileUpload
                    allowedFileTypes=".pdf,.jpg,.jpeg,.png"
                    name="uploadPan"
                    onFileUploaded={(info) => handleSupervisorFileUpload({
                      formControlName: 'supervisorPan',
                      serverResponse: info.serverResponse
                    })}
                  />
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={4}>
                  <label className="form-label fw-semibold">District *</label>
                  <select
                    className={`form-select form-control-custom ${supervisorErrors.districtRefId ? 'is-invalid' : ''}`}
                    value={supervisorForm.districtRefId}
                    onChange={handleSupervisorDistrictChange}
                    required
                  >
                    <option value="">-select-</option>
                    {workingAreaLogic.availableDistricts.map(district => (
                      <option key={district.districtRefId} value={district.districtRefId}>
                        {district.districtName}
                      </option>
                    ))}
                  </select>
                  {supervisorErrors.districtRefId && (
                    <div className="invalid-feedback d-block">
                      {supervisorErrors.districtRefId}
                    </div>
                  )}
                </Col>
                
                <Col md={4}>
                  <label className="form-label fw-semibold">Tehsil *</label>
                  <select
                    className={`form-select form-control-custom ${supervisorErrors.tehsilRefId ? 'is-invalid' : ''}`}
                    value={supervisorForm.tehsilRefId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSupervisorForm(prev => ({ ...prev, tehsilRefId: value }));
                      validateField('tehsilRefId', value, 'supervisor');
                    }}
                    required
                    disabled={!supervisorForm.districtRefId}
                  >
                    <option value="">-select-</option>
                    {supervisorForm.districtRefId && 
                      workingAreaLogic.getAllWorkingTehsils(Number(supervisorForm.districtRefId)).map(tehsil => (
                        <option key={tehsil.tehsilRefId} value={tehsil.tehsilRefId}>
                          {tehsil.tehsilName}
                        </option>
                      ))
                    }
                  </select>
                  {supervisorErrors.tehsilRefId && (
                    <div className="invalid-feedback d-block">
                      {supervisorErrors.tehsilRefId}
                    </div>
                  )}
                </Col>
              </Row>

              {/* Supervisor Table */}
              <div className="mt-4">
                <DataTable
                  title="Supervisor Details"
                  columns={['S.No.', 'Name Of Supervisor', 'Certificate Number', 'District', 'Tehsil', 'Valid Upto', 'Online', 'Action']}
                  rows={formatSupervisorForTable(supervisorsList)}
                  isMobileView={false}
                  onActionClick={(row) => handleDeleteSupervisor(row.supervisorData.id)}
                  actionButton={{
                    label: "Delete",
                    icon: "fa-solid fa-trash",
                    variant: "outline-danger"
                  }}
                />
              </div>

              {/* Add Supervisor Button */}
              <div className="d-flex justify-content-end mt-4">
                <LoadingButton
                  variant="primary"
                  onClick={handleAddSupervisor}
                  loading={isAddingSupervisor}
                  className="btn-custom"
                >
                  <i className="bx bx-plus me-2" style={{ fontSize: '18px' }}></i>
                  Add Supervisor
                </LoadingButton>
              </div>
              </Card.Body>
            </Card>

            {/* 2. Wireman Details Section */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-light">
                <h6 className="mb-0 text-primary fw-semibold">
                  <i className="bi bi-tools me-2"></i>
                  2. Wireman Details
                </h6>
              </Card.Header>
              <Card.Body>
                {/* Offline/Online Toggle */}
              <Row className="mb-4">
                <Col md={12}>
                  <div className="form-check-container d-flex gap-4">
                    <Form.Check
                      type="radio"
                      id="wiremanOffline"
                      name="wiremanMode"
                      label="Offline"
                      checked={isWiremanOffline}
                      onChange={() => handleWiremanModeChange(true)}
                      className="form-check-custom"
                    />
                    <Form.Check
                      type="radio"
                      id="wiremanOnline"
                      name="wiremanMode"
                      label="Online"
                      checked={!isWiremanOffline}
                      onChange={() => handleWiremanModeChange(false)}
                      className="form-check-custom"
                    />
                  </div>
                </Col>
              </Row>

              {/* Wireman Form Fields */}
              <Row className="g-3">
                <Col md={4}>
                  <FormField
                    label="Appointed Wireman"
                    type="text"
                    value={wiremanForm.fullName}
                    onChange={(value) => handleWiremanFieldChange('fullName', value)}
                    placeholder="Enter wireman name"
                    required
                    disabled={!isWiremanOffline}
                    className={`form-control-custom ${wiremanErrors.fullName ? 'is-invalid' : ''}`}
                    error={wiremanErrors.fullName}
                  />
                </Col>
                
                <Col md={4}>
                  <FormField
                    label="Permit Number"
                    type="text"
                    value={wiremanForm.licenceNo}
                    onChange={(value) => {
                      handleWiremanFieldChange('licenceNo', value);
                      // Trigger certificate validation with debounce
                      handleWiremanCertificateChange(value, !isWiremanOffline);
                    }}
                    placeholder="Enter permit number"
                    required
                    className={`form-control-custom ${wiremanErrors.licenceNo ? 'is-invalid' : ''} ${isValidatingWireman ? 'validating' : ''}`}
                    error={wiremanErrors.licenceNo}
                    disabled={isValidatingWireman}
                  />
                  {isValidatingWireman && (
                    <div className="text-info mt-1">
                      <i className="fa fa-spinner fa-spin me-1"></i>
                      Validating permit...
                    </div>
                  )}
                </Col>
                
                <Col md={4}>
                  <FormField
                    label="Valid up to"
                    type="date"
                    value={wiremanForm.licenceValidUpto}
                    onChange={(value) => handleWiremanFieldChange('licenceValidUpto', value)}
                    required
                    disabled={!isWiremanOffline}
                    className={`form-control-custom ${wiremanErrors.licenceValidUpto ? 'is-invalid' : ''}`}
                    error={wiremanErrors.licenceValidUpto}
                  />
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={4}>
                  <FormField
                    label="PAN NO"
                    type="text"
                    value={wiremanForm.panNo}
                    onChange={(value) => handleWiremanFieldChange('panNo', value.toUpperCase())}
                    placeholder="Enter PAN number"
                    required
                    disabled={!isWiremanOffline}
                    className={`form-control-custom ${wiremanErrors.panNo ? 'is-invalid' : ''}`}
                    error={wiremanErrors.panNo}
                  />
                </Col>
                
                <Col md={4}>
                  <label className="form-label fw-semibold">
                    Upload Wireman Permit *
                  </label>
                  <FileUpload
                    allowedFileTypes=".pdf,.jpg,.jpeg,.png"
                    name="uploadPan"
                    onFileUploaded={(info) => handleWiremanFileUpload({
                      formControlName: 'wiremanPermit',
                      serverResponse: info.serverResponse
                    })}
                  />
                </Col>
                
                <Col md={4}>
                  <label className="form-label fw-semibold">
                    Upload PAN *
                  </label>
                  <FileUpload
                    allowedFileTypes=".pdf,.jpg,.jpeg,.png"
                    name="uploadPan"
                    onFileUploaded={(info) => handleWiremanFileUpload({
                      formControlName: 'wiremanPan',
                      serverResponse: info.serverResponse
                    })}
                  />
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={4}>
                  <label className="form-label fw-semibold">District *</label>
                  <select
                    className={`form-select form-control-custom ${wiremanErrors.districtRefId ? 'is-invalid' : ''}`}
                    value={wiremanForm.districtRefId}
                    onChange={handleWiremanDistrictChange}
                    required
                  >
                    <option value="">-select-</option>
                    {workingAreaLogic.availableDistricts.map(district => (
                      <option key={district.districtRefId} value={district.districtRefId}>
                        {district.districtName}
                      </option>
                    ))}
                  </select>
                  {wiremanErrors.districtRefId && (
                    <div className="invalid-feedback d-block">
                      {wiremanErrors.districtRefId}
                    </div>
                  )}
                </Col>
                
                <Col md={4}>
                  <label className="form-label fw-semibold">Tehsil *</label>
                  <select
                    className={`form-select form-control-custom ${wiremanErrors.tehsilRefId ? 'is-invalid' : ''}`}
                    value={wiremanForm.tehsilRefId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setWiremanForm(prev => ({ ...prev, tehsilRefId: value }));
                      validateField('tehsilRefId', value, 'wireman');
                    }}
                    required
                    disabled={!wiremanForm.districtRefId}
                  >
                    <option value="">-select-</option>
                    {wiremanForm.districtRefId && 
                      workingAreaLogic.getAllWorkingTehsils(Number(wiremanForm.districtRefId)).map(tehsil => (
                        <option key={tehsil.tehsilRefId} value={tehsil.tehsilRefId}>
                          {tehsil.tehsilName}
                        </option>
                      ))
                    }
                  </select>
                  {wiremanErrors.tehsilRefId && (
                    <div className="invalid-feedback d-block">
                      {wiremanErrors.tehsilRefId}
                    </div>
                  )}
                </Col>
              </Row>

              {/* Wireman Table */}
              <div className="mt-4">
                <DataTable
                  title="Wireman Details"
                  columns={['S.No.', 'Appointed Wireman', 'Permit Number', 'District', 'Tehsil', 'Valid Upto', 'Online', 'Action']}
                  rows={formatWiremanForTable(wiremansList)}
                  isMobileView={false}
                  onActionClick={(row) => handleDeleteWireman(row.wiremanData.id)}
                  actionButton={{
                    label: "Delete",
                    icon: "fa-solid fa-trash",
                    variant: "outline-danger"
                  }}
                />
              </div>

              {/* Add Wireman Button */}
              <div className="d-flex justify-content-end mt-4">
                <LoadingButton
                  variant="primary"
                  onClick={handleAddWireman}
                  loading={isAddingWireman}
                  className="btn-custom"
                >
                  <i className="bx bx-plus me-2" style={{ fontSize: '18px' }}></i>
                  Add Wireman
                </LoadingButton>
              </div>
              </Card.Body>
            </Card>

            {/* Working Area Completion Status */}
            <div className="completion-status mt-4">
              <Card className="border-0 bg-light">
                <Card.Body className="p-3">
                  <h6 className="mb-3 text-primary">
                    <i className="bi bi-clipboard-check me-2"></i>
                    Working Area Coverage Status
                  </h6>
                  
                  {workingAreaLogic.isLoading ? (
                    <div className="text-center py-3">
                      <i className="fa fa-spinner fa-spin me-2"></i>
                      Loading working areas...
                    </div>
                  ) : workingAreaLogic.error ? (
                    <div className="alert alert-warning small">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {workingAreaLogic.error}
                    </div>
                  ) : (
                    <Row className="g-3">
                      <Col md={4}>
                        <div className="text-center">
                          <div className="fs-5 fw-bold text-info">
                            {workingAreaLogic.workingAreaList.length}
                          </div>
                          <div className="small text-muted">Total Working Areas</div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-center">
                          <div className="fs-5 fw-bold text-success">
                            {supervisorsList.length}
                          </div>
                          <div className="small text-muted">Supervisors Added</div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-center">
                          <div className="fs-5 fw-bold text-warning">
                            {wiremansList.length}
                          </div>
                          <div className="small text-muted">Wiremans Added</div>
                        </div>
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </div>

            {/* Navigation Buttons */}
            <div className="navigation-buttons mt-5 d-flex justify-content-between">
              <Button
                variant="outline-secondary"
                onClick={() => navigate(-1)}
                className="btn-navigation"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Previous
              </Button>
              
              <Button
                variant="primary"
                onClick={handleSaveAndNext}
                className="btn-navigation"
                disabled={isAddingSupervisor || isAddingWireman}
              >
                {isAddingSupervisor || isAddingWireman ? (
                  <>
                    <i className="fa fa-spinner fa-spin me-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <i className="bi bi-arrow-right ms-2"></i>
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Reuse the same styles from ContractorApplicantDetails */}
      <style>{`
        /* Apply global font family */
        * {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }

        .card {
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .card-header {
          border-bottom: 2px solid #e9ecef;
          background-color: #f8f9fa !important;
          font-weight: 600;
          border-radius: 12px 12px 0 0 !important;
        }

        .section-header h6 {
          color: #495057;
          font-size: 1.1rem;
          margin-bottom: 0;
          font-weight: 600;
        }

        .form-label {
          font-weight: 500;
          color: #495057;
          margin-bottom: 0.5rem;
          font-size: 14px;
        }

        .form-label.required::after {
          content: " *";
          color: #dc3545;
        }

        .form-control-custom {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 0.75rem;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background-color: #ffffff;
        }

        .form-control-custom:focus {
          border-color: #4facfe;
          box-shadow: 0 0 0 0.2rem rgba(79, 172, 254, 0.25);
          background-color: #ffffff;
        }

        .form-control-custom.is-invalid {
          border-color: #dc3545;
          background-color: #fff5f5;
        }

        .form-control-custom.validating {
          border-color: #17a2b8;
          background-color: #f8f9fa;
        }

        .btn-custom {
          border-radius: 8px;
          font-weight: 500;
          padding: 0.625rem 1.5rem;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .btn-custom:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .btn-outline-custom {
          background-color: transparent;
          border: 2px solid #6c757d;
          color: #6c757d;
          border-radius: 8px;
          font-weight: 500;
          padding: 0.625rem 1.5rem;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .btn-outline-custom:hover {
          background-color: #6c757d;
          border-color: #6c757d;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .btn-navigation {
          min-width: 120px;
          border-radius: 8px;
          font-weight: 500;
          padding: 0.75rem 1.5rem;
          transition: all 0.3s ease;
        }

        .btn-navigation:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .supervisor-details-section,
        .wireman-details-section {
          border-radius: 12px;
          border: 3px solid #e9ecef;
          padding: 2rem;
          background-color: #ffffff;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          margin-bottom: 2rem;
        }

        .supervisor-details-section:hover,
        .wireman-details-section:hover {
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
          border-color: #dee2e6;
        }

        .data-table {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .data-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
          padding: 1rem 0.75rem;
          font-size: 0.875rem;
        }

        .data-table td {
          padding: 0.875rem 0.75rem;
          vertical-align: middle;
          border-bottom: 1px solid #e9ecef;
          font-size: 0.875rem;
        }

        .data-table tbody tr:hover {
          background-color: #f8f9fa;
        }

        .alert {
          border-radius: 8px;
          border: none;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .form-check-custom {
          margin-right: 1.5rem;
        }

        .form-check-custom .form-check-input {
          border: 2px solid #dee2e6;
          border-radius: 50%;
        }

        .form-check-custom .form-check-input:checked {
          background-color: #007bff;
          border-color: #007bff;
        }

        .form-check-custom .form-check-label {
          font-weight: 500;
          color: #495057;
          margin-left: 0.5rem;
        }

        .completion-status {
          border-radius: 12px;
          padding: 1.5rem;
        }

        .invalid-feedback {
          font-size: 0.825rem;
          margin-top: 0.25rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .supervisor-details-section,
          .wireman-details-section {
            padding: 1.5rem;
            border-width: 2px;
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

export default ContractorSupervisor;
