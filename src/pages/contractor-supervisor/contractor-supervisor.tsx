import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import FormField from '../../components/shared-component/FormField';
import DataTable from '../../components/shared-component/DataTable';
import LoadingButton from '../../components/shared-component/LoadingButton';
import FileUpload from '../../components/FileUpload';
import { useContractorForm } from '../../hooks/useContractorForm';
import { useSupervisorValidation } from '../../hooks/useSupervisorValidation';
import { useSupervisorData } from '../../hooks/useSupervisorData';
import { useSupervisorPageData } from '../../hooks/contractor/useSupervisorPageData';
import encryptionService from '../../lib/encryptionService';
import { userDetailsService } from '../../services/api/userDetailsService';
import { ContractorPayloadBuilder } from '../../services/contractorPayloadBuilder';
import SweetAlert from 'sweetalert2';
import { 
  transformSupervisorFormToData, 
  transformWiremanFormToData,
  formatSupervisorForTable,
  formatWiremanForTable,
  getSuccessMessage,
  getErrorMessage
} from '../../utils/supervisorUtils';
import { EMPTY_SUPERVISOR_FORM, EMPTY_WIREMAN_FORM } from '../../constants/supervisor';

const ContractorSupervisor: React.FC = () => {
  const navigate = useNavigate();
  const location = useRouterLocation();
  
  // Refs for input focus (Angular parity)
  const supervisorCertificateRef = useRef<HTMLInputElement>(null);
  const wiremanPermitRef = useRef<HTMLInputElement>(null);
  
  // ✅ 1. QUERY PARAMETERS & CONTEXT - Using uniform React patterns
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
  
  // Processing states
  const [existingSupervisorsFromAPI, setExistingSupervisorsFromAPI] = useState<any[]>([]);
  const [existingWiremansFromAPI, setExistingWiremansFromAPI] = useState<any[]>([]);
  
  // ✅ Query Parameter Processing (Angular Constructor Equivalent)
  useEffect(() => {
    console.log('🔄 [SUPERVISOR-INIT] ===== PROCESSING QUERY PARAMETERS =====');
    const urlParams = new URLSearchParams(location.search);
    
    try {
      // Decrypt and parse all query parameters (Angular parity)
      const encryptedWorkingAreaList = urlParams.get('workingAreaList');
      const encryptedFormMode = urlParams.get('formMode');
      const encryptedSelectedDistricts = urlParams.get('selectedWorkingAreaDistrictsList');
      const encryptedAppRefId = urlParams.get('appRefId');
      const encryptedContractorLicenceId = urlParams.get('contractorLicenceId');
      const encryptedApplicationContractorType = urlParams.get('applicationContractorType');
      const encryptedApplicationIsLocked = urlParams.get('applicationIsLocked');
      const encryptedRenewAppId = urlParams.get('renewAppId');
      const encryptedIs30DaysCrossed = urlParams.get('is30DaysCrossed');
      
      if (!encryptedWorkingAreaList || !encryptedFormMode || !encryptedAppRefId) {
        console.error('❌ [SUPERVISOR-INIT] Missing required encrypted parameters');
        SweetAlert.fire({
          title: 'Invalid Navigation',
          text: 'Missing required application data. Redirecting to contractor info.',
          icon: 'error'
        }).then(() => {
          navigate('/dashboard/license/contractor-info');
        });
        return;
      }
      
      // Decrypt parameters with null safety
      const workingAreaList = JSON.parse(encryptionService.get(encryptedWorkingAreaList));
      const contractorFormMode = encryptionService.get(encryptedFormMode);
      const selectedWorkingAreaDistrictsList = encryptedSelectedDistricts ? JSON.parse(encryptionService.get(encryptedSelectedDistricts)) : [];
      const appRefId = parseInt(encryptionService.get(encryptedAppRefId));
      const contractorLicenceId = encryptedContractorLicenceId ? parseInt(encryptionService.get(encryptedContractorLicenceId)) : 0;
      const applicationContractorType = encryptedApplicationContractorType ? encryptionService.get(encryptedApplicationContractorType) : '';
      const applicationIsLocked = encryptedApplicationIsLocked ? JSON.parse(encryptionService.get(encryptedApplicationIsLocked)) : false;
      const renewAppId = encryptedRenewAppId ? parseInt(encryptionService.get(encryptedRenewAppId)) : undefined;
      const is30DaysCrossed = encryptedIs30DaysCrossed ? JSON.parse(encryptionService.get(encryptedIs30DaysCrossed)) : undefined;
      
      // Validation: Form mode must be 'new' or 'renew' (Angular validation)
      if (!contractorFormMode || !['new', 'renew'].includes(contractorFormMode)) {
        console.error('❌ [SUPERVISOR-INIT] Invalid contractorFormMode:', contractorFormMode);
        SweetAlert.fire({
          title: 'Invalid Application Mode',
          text: 'Invalid contractor form mode. Redirecting to contractor info.',
          icon: 'error'
        }).then(() => {
          navigate('/dashboard/license/contractor-info');
        });
        return;
      }
      
      // Set application context
      setApplicationContext({
        workingAreaList,
        contractorFormMode,
        selectedWorkingAreaDistrictsList,
        appRefId,
        contractorLicenceId,
        applicationContractorType,
        applicationIsLocked,
        renewAppId,
        is30DaysCrossed
      });
      
      console.log('✅ [SUPERVISOR-INIT] Application context set successfully');
      
    } catch (error) {
      console.error('❌ [SUPERVISOR-INIT] Error processing query parameters:', error);
      SweetAlert.fire({
        title: 'Parameter Processing Error',
        text: 'Failed to process application data. Redirecting to contractor info.',
        icon: 'error'
      }).then(() => {
        navigate('/dashboard/license/contractor-info');
      });
    }
  }, [location.search, navigate]);
  
  // ✅ 2. FORM SETUP & VALIDATION - Using custom hook useSupervisorValidation
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
    validateField
  } = useSupervisorValidation();

  // Data management hooks
  const {
    isAddingSupervisor,
    isAddingWireman,
    setIsAddingSupervisor,
    setIsAddingWireman,
    addSupervisor,
    addWireman,
    deleteSupervisor,
    deleteWireman
  } = useSupervisorData();

  // Page-level data management
  const {
    totalSupervisors,
    totalWiremans,
    maxSupervisors,
    maxWiremans,
    isLoading: isPageLoading,
    hasExpiredSupervisors,
    hasExpiredWiremans,
    refreshData,
    checkExpiryStatus
  } = useSupervisorPageData();

  // Application workflow integration
  const { 
    apprefId, 
    ensureApplicationExists
  } = useContractorForm();

  // Use API data exclusively - Remove static data fallback
  const supervisorsList = existingSupervisorsFromAPI;
  const wiremansList = existingWiremansFromAPI;
  
  // Debug: Log the actual data being used in tables
  console.log('📊 [TABLE-DATA] Supervisors for table display:', supervisorsList);
  console.log('📊 [TABLE-DATA] Wiremans for table display:', wiremansList);
  console.log('🏗️ [DISTRICT-DATA] Available districts:', applicationContext?.selectedWorkingAreaDistrictsList);
  console.log('🏗️ [WORKING-AREA-DATA] Working area list:', applicationContext?.workingAreaList);

  // ✅ 3. OFFLINE/ONLINE TOGGLE - Following existing mode-switch pattern
  const [isSupervisorOffline, setIsSupervisorOffline] = useState(true);
  const [isWiremanOffline, setIsWiremanOffline] = useState(true);
  
  // Loading and error states
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // ✅ Load Existing Supervisor/Wireman Data (Angular ngAfterViewInit equivalent)
  useEffect(() => {
    if (!applicationContext?.appRefId) return;
    
    const loadExistingSupervisorWiremanData = async () => {
      console.log('📊 [SUPERVISOR-DATA] ===== LOADING EXISTING DATA =====');
      console.log('📊 [SUPERVISOR-DATA] AppRefId:', applicationContext.appRefId);
      
      try {
        const response = await userDetailsService.getContractorWorkerDetails(applicationContext.appRefId);
        
        if (response.success && response.data?.formModel?.[0]) {
          const data = response.data.formModel[0];
          console.log('📊 [SUPERVISOR-DATA] Raw API response:', data);
          
          // ✅ 7. LICENSE EXPIRY VALIDATION - Load existing supervisors with license expiry validation
          const existingSupervisors = data.supervisorLicence_Backlog || [];
          const validatedSupervisors = validateLicenseExpiry(existingSupervisors, 'supervisor');
          setExistingSupervisorsFromAPI(validatedSupervisors);
          console.log('✅ [SUPERVISOR-DATA] Loaded supervisors:', validatedSupervisors.length);
          
          // Load existing wiremans with license expiry validation  
          const existingWiremans = data.wiremanLicence_BackLog || [];
          const validatedWiremans = validateLicenseExpiry(existingWiremans, 'wireman');
          setExistingWiremansFromAPI(validatedWiremans);
          console.log('✅ [SUPERVISOR-DATA] Loaded wiremans:', validatedWiremans.length);
          
        } else {
          console.log('⚠️ [SUPERVISOR-DATA] No existing data found for appRefId:', applicationContext.appRefId);
        }
      } catch (error) {
        console.error('❌ [SUPERVISOR-DATA] Error loading existing data:', error);
        SweetAlert.fire({
          title: 'Data Loading Error',
          text: 'Failed to load existing supervisor/wireman data.',
          icon: 'error'
        });
      }
    };
    
    loadExistingSupervisorWiremanData();
  }, [applicationContext?.appRefId]);
  
  // ✅ 7. LICENSE EXPIRY VALIDATION - Offline: local date comparison, Online: live API validation
  const validateLicenseExpiry = (licenseList: any[], type: 'supervisor' | 'wireman') => {
    return licenseList.map(license => {
      if (!license.isOnline) {
        // Offline license - check expiry date
        const expiryDate = new Date(license.licenceValidUpto);
        const today = new Date();
        expiryDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        license.licenceExpired = expiryDate < today;
        console.log(`📅 [LICENSE-CHECK] ${type} ${license.licenceNo}: ${license.licenceExpired ? 'EXPIRED' : 'VALID'}`);
      } else {
        // Online license validation would require API call (implemented in certificate validation hook)
        console.log(`🌐 [LICENSE-CHECK] ${type} ${license.licenceNo}: Online license (requires API validation)`);
      }
      return license;
    });
  };

  // ✅ 3. OFFLINE/ONLINE TOGGLE - Mode change handlers with field enable/disable
  const handleSupervisorModeChange = (isOffline: boolean) => {
    setIsSupervisorOffline(isOffline);
    
    // Angular parity: Reset form fields for both modes
    setSupervisorForm({ ...EMPTY_SUPERVISOR_FORM });
    
    // Clear validation errors
    clearSupervisorOnlineErrors();
    
    if (!isOffline) {
      // Online mode: focus certificate input (Angular parity)
      setTimeout(() => {
        supervisorCertificateRef.current?.focus();
      }, 100);
    }
  };

  const handleWiremanModeChange = (isOffline: boolean) => {
    setIsWiremanOffline(isOffline);
    
    // Angular parity: Reset form fields for both modes
    setWiremanForm({ ...EMPTY_WIREMAN_FORM });
    
    // Clear validation errors
    clearWiremanOnlineErrors();
    
    if (!isOffline) {
      // Online mode: focus permit input (Angular parity)
      setTimeout(() => {
        wiremanPermitRef.current?.focus();
      }, 100);
    }
  };

  // ✅ 4. DISTRICT/TEHSIL RESTRICTION - District change handlers using working area filtering
  const handleSupervisorDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setSupervisorForm(prev => ({
      ...prev,
      districtRefId: districtId,
      tehsilRefId: ''
    }));
    validateField('districtRefId', districtId, 'supervisor');
  };

  const handleWiremanDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setWiremanForm(prev => ({
      ...prev,
      districtRefId: districtId,
      tehsilRefId: ''
    }));
    validateField('districtRefId', districtId, 'wireman');
  };

  // ✅ 5. FILE UPLOAD - Reuse FileUpload component with consistent state update
  const handleSupervisorFileUpload = (info: { formControlName: string; serverResponse: any }) => {
    setSupervisorForm(prev => ({
      ...prev,
      [info.formControlName]: info.serverResponse.generatedFileNames
    }));
    console.log('✅ [FILE-UPLOAD] Supervisor file uploaded:', info.formControlName);
  };

  const handleWiremanFileUpload = (info: { formControlName: string; serverResponse: any }) => {
    setWiremanForm(prev => ({
      ...prev,
      [info.formControlName]: info.serverResponse.generatedFileNames
    }));
    console.log('✅ [FILE-UPLOAD] Wireman file uploaded:', info.formControlName);
  };

  // Add supervisor handler
  const handleAddSupervisor = async () => {
    // Validate form
    if (!validateSupervisorForm()) {
      setSaveError('Please fill all required fields correctly');
      return;
    }
    
    // Check for duplicate working area (Angular parity)
    const districtRefId = Number(supervisorForm.districtRefId);
    const tehsilRefId = Number(supervisorForm.tehsilRefId);
    
    if (districtRefId && tehsilRefId) {
      // Check for duplicate supervisor in same working area
      const isDuplicate = supervisorsList.some(supervisor => 
        supervisor.districtRefId === districtRefId && supervisor.tehsilRefId === tehsilRefId
      );
      
      if (isDuplicate) {
        SweetAlert.fire({ icon: 'error', text: "Oops! You had already added a supervisor for same working area" });
        return;
      }
    }
    
    setIsAddingSupervisor(true);
    setSaveError(null);
    
    try {
      // Ensure application exists (matching Angular pattern)
      let currentApprefId = applicationContext?.appRefId || apprefId;
      if (!currentApprefId || currentApprefId === 0) {
        console.log('🏗️ [SUPERVISOR] apprefId is 0, creating application details first');
        currentApprefId = await ensureApplicationExists();
        if (!currentApprefId) {
          throw new Error('Failed to create application details');
        }
      }

      // Transform form data and add supervisor
      const supervisorData = transformSupervisorFormToData(
        supervisorForm,
        applicationContext?.selectedWorkingAreaDistrictsList?.map(district => ({
          districtCode: district.districtRefId,
          districtName: district.districtName || '',
          stateId: 1 // Default state ID
        })) || [],
        applicationContext?.workingAreaList
          ?.filter(area => area.districtRefId === Number(supervisorForm.districtRefId))
          ?.map(tehsil => ({
            tehsilId: tehsil.tehsilRefId,
            tehsilName: tehsil.tehsilName,
            districtId: tehsil.districtRefId
          })) || [],
        !isSupervisorOffline,
        applicationContext?.contractorLicenceId || 0
      );
      
      await addSupervisor(supervisorData);
      
      // Reset form and show success
      resetSupervisorForm();
      setSaveSuccess(getSuccessMessage('supervisor', 'add'));
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
    
    // Check for duplicate working area (Angular parity)
    const districtRefId = Number(wiremanForm.districtRefId);
    const tehsilRefId = Number(wiremanForm.tehsilRefId);
    
    if (districtRefId && tehsilRefId) {
      // Check for duplicate wireman in same working area
      const isDuplicate = wiremansList.some(wireman => 
        wireman.districtRefId === districtRefId && wireman.tehsilRefId === tehsilRefId
      );
      
      if (isDuplicate) {
        SweetAlert.fire({ icon: 'error', text: "Oops! You had already added a wireman for same working area" });
        return;
      }
    }
    
    setIsAddingWireman(true);
    setSaveError(null);
    
    try {
      // Ensure application exists (matching Angular pattern)
      let currentApprefId = applicationContext?.appRefId || apprefId;
      if (!currentApprefId || currentApprefId === 0) {
        console.log('🏗️ [WIREMAN] apprefId is 0, creating application details first');
        currentApprefId = await ensureApplicationExists();
        if (!currentApprefId) {
          throw new Error('Failed to create application details');
        }
      }

      // Transform form data and add wireman
      const wiremanData = transformWiremanFormToData(
        wiremanForm,
        applicationContext?.selectedWorkingAreaDistrictsList?.map(district => ({
          districtCode: district.districtRefId,
          districtName: district.districtName || '',
          stateId: 1 // Default state ID
        })) || [],
        applicationContext?.workingAreaList
          ?.filter(area => area.districtRefId === Number(wiremanForm.districtRefId))
          ?.map(tehsil => ({
            tehsilId: tehsil.tehsilRefId,
            tehsilName: tehsil.tehsilName,
            districtId: tehsil.districtRefId
          })) || [],
        !isWiremanOffline,
        applicationContext?.contractorLicenceId || 0
      );
      
      await addWireman(wiremanData);
      
      // Reset form and show success
      resetWiremanForm();
      setSaveSuccess(getSuccessMessage('wireman', 'add'));
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
    SweetAlert.fire({
      title: 'Delete Supervisor',
      text: 'Are you sure you want to delete this supervisor?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSupervisor(id);
        setSaveSuccess(getSuccessMessage('supervisor', 'delete'));
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    });
  };

  const handleDeleteWireman = (id: number) => {
    SweetAlert.fire({
      title: 'Delete Wireman',
      text: 'Are you sure you want to delete this wireman?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteWireman(id);
        setSaveSuccess(getSuccessMessage('wireman', 'delete'));
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    });
  };

  // ✅ 8. SAVE & NEXT LOGIC - Validate completion requirements and navigate
  const handleSaveAndNext = async () => {
    console.log('💾 [SAVE_AND_NEXT] Starting validation...');
    
    // Simple validation: Check if we have at least one supervisor and one wireman
    const hasValidSupervisors = supervisorsList.length > 0;
    const hasValidWiremans = wiremansList.length > 0;
    
    // Check for expired licenses
    const expiredSupervisors = supervisorsList.filter(s => s.licenceExpired);
    const expiredWiremans = wiremansList.filter(w => w.licenceExpired);
    
    const validationResult = {
      isValid: hasValidSupervisors && hasValidWiremans && expiredSupervisors.length === 0 && expiredWiremans.length === 0,
      message: '',
      expiredLicences: {
        supervisors: expiredSupervisors,
        wiremans: expiredWiremans
      }
    };
    
    if (!hasValidSupervisors) {
      validationResult.message = 'At least one supervisor is required';
    } else if (!hasValidWiremans) {
      validationResult.message = 'At least one wireman is required';
    } else if (expiredSupervisors.length > 0 || expiredWiremans.length > 0) {
      validationResult.message = 'Some licenses have expired';
    }
    
    console.log('💾 [SAVE_AND_NEXT] Validation result:', validationResult);
    
    if (!validationResult.isValid) {
      console.log('❌ [SAVE_AND_NEXT] Validation failed:', validationResult.message);
      
      // Show expired licence details (Angular parity)
      if (validationResult.expiredLicences?.supervisors?.length > 0 || 
          validationResult.expiredLicences?.wiremans?.length > 0) {
        
        const expiredSupervisorLicences = validationResult.expiredLicences.supervisors;
        const expiredWiremanLicences = validationResult.expiredLicences.wiremans;
        
        const expiredLicencesMessage = `
          ${expiredSupervisorLicences.length > 0 ? `Expired Supervisor Licences: <b style="color:#034078 ;">${expiredSupervisorLicences.join(', ')}</b>` : ''}
          <br>
          ${expiredWiremanLicences.length > 0 ? `Expired Wireman Licences: <b style="color:#034078 ;">${expiredWiremanLicences.join(', ')}</b>` : ''}
        `;

        SweetAlert.fire({
          title: "OOPS !",
          icon: 'error',
          html: `The following licences have expired:<br><hr>${expiredLicencesMessage}<hr> <br>  <p>Please remove these expired licences and add new one to proceed.</p>`
        });
        return;
      } else {
        SweetAlert.fire({ icon: 'error', text: validationResult.message });
        return;
      }
    }
    
    console.log('✅ [SAVE_AND_NEXT] Validation passed, navigating to next page');
    
    try {
      // Encrypt & navigate using uniform query param helper (Angular parity)
      const queryParams = ContractorPayloadBuilder.buildQueryParams({
        appRefId: applicationContext?.appRefId || apprefId,
        contractorFormMode: applicationContext?.contractorFormMode || 'new',
        applicationIsLocked: applicationContext?.applicationIsLocked || false,
        applicationContractorType: applicationContext?.applicationContractorType || '',
        renewAppId: applicationContext?.renewAppId,
        is30DaysCrossed: applicationContext?.is30DaysCrossed
      }, encryptionService);
      
      const queryString = new URLSearchParams(queryParams).toString();
      navigate(`/dashboard/license/attachments?${queryString}`);
      
    } catch (error) {
      console.error('❌ [SAVE_AND_NEXT] Error building query params:', error);
      setSaveError('Failed to navigate to next page. Please try again.');
    }
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
                      // Trigger certificate validation with debounce (Angular parity)
                      const contractorFormMode = applicationContext?.contractorFormMode === 'renew' ? 'renew' : 'new';
                      const renewAppId = applicationContext?.renewAppId;
                      handleSupervisorCertificateChange(value, !isSupervisorOffline, contractorFormMode, renewAppId);
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
                    {applicationContext?.selectedWorkingAreaDistrictsList?.map(district => (
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
                      applicationContext?.workingAreaList
                        ?.filter(area => area.districtRefId === Number(supervisorForm.districtRefId))
                        ?.map(tehsil => (
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
                      // Trigger certificate validation with debounce (Angular parity)
                      const contractorFormMode = applicationContext?.contractorFormMode === 'renew' ? 'renew' : 'new';
                      const renewAppId = applicationContext?.renewAppId;
                      handleWiremanCertificateChange(value, !isWiremanOffline, contractorFormMode, renewAppId);
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
                    {applicationContext?.selectedWorkingAreaDistrictsList?.map(district => (
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
                      applicationContext?.workingAreaList
                        ?.filter(area => area.districtRefId === Number(wiremanForm.districtRefId))
                        ?.map(tehsil => (
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
