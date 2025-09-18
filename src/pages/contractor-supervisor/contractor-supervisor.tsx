import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import FormField from '../../components/shared-component/FormField';
import DataTable from '../../components/shared-component/DataTable';
import LoadingButton from '../../components/shared-component/LoadingButton';
import FileUpload from '../../components/FileUpload';
import { useSupervisorBusinessLogic } from '../../modules/supervisor/hooks/useSupervisorBusinessLogicSimple';
import encryptionService from '../../lib/encryptionService';
import { applicationServices } from '../../services/api/applicationServices';
import { ContractorPayloadBuilder } from '../../services/contractorPayloadBuilder';
import SweetAlert from 'sweetalert2';
import { 
  getSuccessMessage,
  getErrorMessage,
  formatSupervisorForTable,
  formatWiremanForTable
} from '../../utils/supervisorUtils';
import { EMPTY_SUPERVISOR_FORM, EMPTY_WIREMAN_FORM } from '../../constants/supervisor';

const ContractorSupervisor: React.FC = () => {
  const navigate = useNavigate();
  
  // Refs for input focus (Angular parity)
  const supervisorCertificateRef = useRef<HTMLInputElement>(null);
  const wiremanPermitRef = useRef<HTMLInputElement>(null);
  
  // ✅ PHASE 2: Business Logic Hook - Consolidates all supervisor logic
  const {
    // Application Context
    applicationContext,
    existingSupervisorsFromAPI,
    setExistingSupervisorsFromAPI,
    existingWiremansFromAPI, 
    setExistingWiremansFromAPI,
    
    // Offline/Online toggle
    isSupervisorOffline, 
    setIsSupervisorOffline,
    isWiremanOffline, 
    setIsWiremanOffline,
    
    // Form validation (from useSupervisorValidation)
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
    clearSupervisorOnlineErrors,
    clearWiremanOnlineErrors,
    validateField,

    // Data management (from useSupervisorData)
    isAddingSupervisor,
    isAddingWireman,
    setIsAddingSupervisor,
    setIsAddingWireman,

    // Page data (from useSupervisorPageData) 
    totalSupervisors,
    totalWiremans,
    maxSupervisors,
    maxWiremans,
    isLoading: isPageLoading,
    hasExpiredSupervisors,
    hasExpiredWiremans,
    refreshData,
    checkExpiryStatus,

    // Application workflow (from useContractorForm)
    apprefId,
    ensureApplicationExists
  } = useSupervisorBusinessLogic();

  // Use API data exclusively - Remove static data fallback
  const supervisorsList = existingSupervisorsFromAPI;
  const wiremansList = existingWiremansFromAPI;
  
  // Debug: Log the actual data being used in tables
  console.log('📊 [TABLE-DATA] Supervisors for table display:', supervisorsList);
  console.log('📊 [TABLE-DATA] Wiremans for table display:', wiremansList);
  console.log('🏗️ [DISTRICT-DATA] Available districts:', applicationContext?.selectedWorkingAreaDistrictsList);
  console.log('🏗️ [WORKING-AREA-DATA] Working area list:', applicationContext?.workingAreaList);

  // Loading and error states (not yet moved to business logic hook)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // ✅ Load Existing Supervisor/Wireman Data (Angular ngAfterViewInit equivalent)
  useEffect(() => {
    if (!applicationContext?.appRefId) return;
    
    const loadExistingSupervisorWiremanData = async () => {
      console.log('📊 [SUPERVISOR-DATA] ===== LOADING EXISTING DATA =====');
      console.log('📊 [SUPERVISOR-DATA] AppRefId:', applicationContext.appRefId);
      
      try {
        const response = await applicationServices.getContractorWorkerDetails(applicationContext.appRefId);
        
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
    console.log('📁 [FILE-UPLOAD] Supervisor file upload info:', info);
    console.log('📁 [FILE-UPLOAD] Generated file name:', info.serverResponse?.generatedFileNames);
    
    setSupervisorForm(prev => ({
      ...prev,
      [info.formControlName]: info.serverResponse.generatedFileNames || ''
    }));
    console.log('✅ [FILE-UPLOAD] Supervisor file uploaded for field:', info.formControlName);
  };

  const handleWiremanFileUpload = (info: { formControlName: string; serverResponse: any }) => {
    console.log('📁 [FILE-UPLOAD] Wireman file upload info:', info);
    console.log('📁 [FILE-UPLOAD] Generated file name:', info.serverResponse?.generatedFileNames);
    
    setWiremanForm(prev => ({
      ...prev,
      [info.formControlName]: info.serverResponse.generatedFileNames || ''
    }));
    console.log('✅ [FILE-UPLOAD] Wireman file uploaded for field:', info.formControlName);
  };

  // Add supervisor handler - Angular parity implementation
  const handleAddSupervisor = async () => {
    console.log('🏗️ [SUPERVISOR] Starting addSupervisor - Angular parity');
    
    // Step 1: Set form submitted state (Angular parity)
    const formValid = validateSupervisorForm();
    if (!formValid) {
      console.log('❌ [SUPERVISOR] Form validation failed');
      setSaveError('Please fill all required fields correctly');
      return;
    }
    
    // Step 2: Ensure application exists (Angular parity)
    let currentApprefId = applicationContext?.appRefId || apprefId;
    if (!currentApprefId || currentApprefId === 0) {
      console.log('🏗️ [SUPERVISOR] apprefId is 0, creating application details first');
      try {
        currentApprefId = await ensureApplicationExists();
        if (!currentApprefId) {
          throw new Error('Failed to create application details');
        }
        console.log('✅ [SUPERVISOR] Application created with apprefId:', currentApprefId);
      } catch (error) {
        console.error('❌ [SUPERVISOR] Error creating application:', error);
        setSaveError('Failed to create application details');
        return;
      }
    }
    
    // Step 3: Check for duplicate working area (Angular parity)
    const districtRefId = Number(supervisorForm.districtRefId);
    const tehsilRefId = Number(supervisorForm.tehsilRefId);
    
    if (districtRefId && tehsilRefId) {
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
      // Step 4: Build payload exactly like Angular
      const districtName = applicationContext?.workingAreaList?.find(
        (element: any) => element.districtRefId === districtRefId
      )?.districtName || '';
      
      const tehsilName = applicationContext?.workingAreaList?.find(
        (element: any) => element.tehsilRefId === tehsilRefId
      )?.tehsilName || '';
      
      // Debug form state before creating payload
      console.log('📝 [SUPERVISOR] Current supervisor form state:', supervisorForm);
      console.log('📁 [SUPERVISOR] Document fields:', {
        licenceDocument: supervisorForm.licenceDocument,
        panNoDocument: supervisorForm.panNoDocument
      });
      
      const supervisorPayload = {
        id: 0,
        isOnline: !isSupervisorOffline,
        appRefId: currentApprefId,
        fullName: supervisorForm.fullName,
        licenceNo: supervisorForm.licenceNo,
        licenceValidUpto: new Date(supervisorForm.licenceValidUpto).toISOString(),
        panNo: supervisorForm.panNo,
        districtRefId: districtRefId,
        districtName: districtName,
        tehsilRefId: tehsilRefId,
        tehsilName: tehsilName,
        isActive: true,
        isDeleted: false,
        licenceDocument: supervisorForm.licenceDocument,
        panNoDocument: supervisorForm.panNoDocument,
        contractorLicenceRefId: applicationContext?.contractorLicenceId || 0
      };
      
      console.log('📤 [SUPERVISOR] Sending payload:', supervisorPayload);
      
      // Step 5: Call API (Angular parity)
      const response = await applicationServices.addUpdateContractSupervisor(supervisorPayload);
      
      if (response.success) {
        console.log('✅ [SUPERVISOR] Successfully added supervisor');
        
        // Step 6: Refresh data (Angular calls getContractorWorkerDetails)
        // Reload existing data to reflect the new addition
        try {
          const refreshResponse = await applicationServices.getContractorWorkerDetails(currentApprefId);
          if (refreshResponse.success && refreshResponse.data?.formModel?.[0]) {
            const data = refreshResponse.data.formModel[0];
            const existingSupervisors = data.supervisorLicence_Backlog || [];
            const existingWiremans = data.wiremanLicence_Backlog || [];
            
            setExistingSupervisorsFromAPI(existingSupervisors);
            setExistingWiremansFromAPI(existingWiremans);
            console.log('🔄 [SUPERVISOR] Data refreshed after supervisor addition');
          }
        } catch (refreshError) {
          console.warn('⚠️ [SUPERVISOR] Could not refresh data:', refreshError);
        }
        
        // Step 7: Reset form (Angular parity)
        setSupervisorForm({ ...EMPTY_SUPERVISOR_FORM });
        
        setSaveSuccess(getSuccessMessage('supervisor', 'add'));
        setTimeout(() => setSaveSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to add supervisor');
      }
    } catch (error) {
      console.error('❌ [SUPERVISOR] Error adding supervisor:', error);
      setSaveError(getErrorMessage('supervisor', 'add'));
    } finally {
      setIsAddingSupervisor(false);
    }
  };

  // Add wireman handler - Angular parity implementation
  const handleAddWireman = async () => {
    console.log('🏗️ [WIREMAN] Starting addWireman - Angular parity');
    
    // Step 1: Set form submitted state (Angular parity)
    const formValid = validateWiremanForm();
    if (!formValid) {
      console.log('❌ [WIREMAN] Form validation failed');
      setSaveError('Please fill all required fields correctly');
      return;
    }
    
    // Step 2: Ensure application exists (Angular parity)
    let currentApprefId = applicationContext?.appRefId || apprefId;
    if (!currentApprefId || currentApprefId === 0) {
      console.log('🏗️ [WIREMAN] apprefId is 0, creating application details first');
      try {
        currentApprefId = await ensureApplicationExists();
        if (!currentApprefId) {
          throw new Error('Failed to create application details');
        }
        console.log('✅ [WIREMAN] Application created with apprefId:', currentApprefId);
      } catch (error) {
        console.error('❌ [WIREMAN] Error creating application:', error);
        setSaveError('Failed to create application details');
        return;
      }
    }
    
    // Step 3: Check for duplicate working area (Angular parity)
    const districtRefId = Number(wiremanForm.districtRefId);
    const tehsilRefId = Number(wiremanForm.tehsilRefId);
    
    if (districtRefId && tehsilRefId) {
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
      // Step 4: Build payload exactly like Angular
      const districtName = applicationContext?.workingAreaList?.find(
        (element: any) => element.districtRefId === districtRefId
      )?.districtName || '';
      
      const tehsilName = applicationContext?.workingAreaList?.find(
        (element: any) => element.tehsilRefId === tehsilRefId
      )?.tehsilName || '';
      
      // Debug form state before creating payload
      console.log('📝 [WIREMAN] Current wireman form state:', wiremanForm);
      console.log('📁 [WIREMAN] Document fields:', {
        licenceDocument: wiremanForm.licenceDocument,
        panNoDocument: wiremanForm.panNoDocument
      });
      
      const wiremanPayload = {
        id: 0,
        isOnline: !isWiremanOffline,
        appRefId: currentApprefId,
        fullName: wiremanForm.fullName,
        licenceNo: wiremanForm.licenceNo,
        licenceValidUpto: new Date(wiremanForm.licenceValidUpto).toISOString(),
        panNo: wiremanForm.panNo,
        districtRefId: districtRefId,
        districtName: districtName,
        tehsilRefId: tehsilRefId,
        tehsilName: tehsilName,
        isActive: true,
        isDeleted: false,
        licenceDocument: wiremanForm.licenceDocument,
        panNoDocument: wiremanForm.panNoDocument,
        contractorLicenceRefId: applicationContext?.contractorLicenceId || 0
      };
      
      console.log('📤 [WIREMAN] Sending payload:', wiremanPayload);
      
      // Step 5: Call API (Angular parity)
      const response = await applicationServices.addUpdateContractWireman(wiremanPayload);
      
      if (response.success) {
        console.log('✅ [WIREMAN] Successfully added wireman');
        
        // Step 6: Refresh data (Angular calls getContractorWorkerDetails)
        try {
          const refreshResponse = await applicationServices.getContractorWorkerDetails(currentApprefId);
          if (refreshResponse.success && refreshResponse.data?.formModel?.[0]) {
            const data = refreshResponse.data.formModel[0];
            const existingSupervisors = data.supervisorLicence_Backlog || [];
            const existingWiremans = data.wiremanLicence_Backlog || [];
            
            setExistingSupervisorsFromAPI(existingSupervisors);
            setExistingWiremansFromAPI(existingWiremans);
            console.log('🔄 [WIREMAN] Data refreshed after wireman addition');
          }
        } catch (refreshError) {
          console.warn('⚠️ [WIREMAN] Could not refresh data:', refreshError);
        }
        
        // Step 7: Reset form (Angular parity)
        setWiremanForm({ ...EMPTY_WIREMAN_FORM });
        
        setSaveSuccess(getSuccessMessage('wireman', 'add'));
        setTimeout(() => setSaveSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to add wireman');
      }
    } catch (error) {
      console.error('❌ [WIREMAN] Error adding wireman:', error);
      setSaveError(getErrorMessage('wireman', 'add'));
    } finally {
      setIsAddingWireman(false);
    }
  };

  // Delete handlers - Angular parity implementation
  const handleDeleteSupervisor = (id: number) => {
    SweetAlert.fire({
      title: 'Delete Supervisor',
      text: 'Are you sure you want to delete this supervisor?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log('🗑️ [SUPERVISOR] Deleting supervisor with id:', id);
          
          const response = await applicationServices.deleteContractSupervisor(id);
          
          if (response.success) {
            console.log('✅ [SUPERVISOR] Successfully deleted supervisor');
            
            // Refresh data after deletion (Angular parity)
            const currentApprefId = applicationContext?.appRefId || apprefId;
            if (currentApprefId) {
              try {
                const refreshResponse = await applicationServices.getContractorWorkerDetails(currentApprefId);
                if (refreshResponse.success && refreshResponse.data?.formModel?.[0]) {
                  const data = refreshResponse.data.formModel[0];
                  const existingSupervisors = data.supervisorLicence_Backlog || [];
                  const existingWiremans = data.wiremanLicence_Backlog || [];
                  
                  setExistingSupervisorsFromAPI(existingSupervisors);
                  setExistingWiremansFromAPI(existingWiremans);
                  console.log('🔄 [SUPERVISOR] Data refreshed after supervisor deletion');
                }
              } catch (refreshError) {
                console.warn('⚠️ [SUPERVISOR] Could not refresh data after deletion:', refreshError);
              }
            }
            
            setSaveSuccess(getSuccessMessage('supervisor', 'delete'));
            setTimeout(() => setSaveSuccess(null), 3000);
          } else {
            throw new Error(response.message || 'Failed to delete supervisor');
          }
        } catch (error) {
          console.error('❌ [SUPERVISOR] Error deleting supervisor:', error);
          setSaveError(getErrorMessage('supervisor', 'delete'));
        }
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log('🗑️ [WIREMAN] Deleting wireman with id:', id);
          
          const response = await applicationServices.deleteContractWireman(id);
          
          if (response.success) {
            console.log('✅ [WIREMAN] Successfully deleted wireman');
            
            // Refresh data after deletion (Angular parity)
            const currentApprefId = applicationContext?.appRefId || apprefId;
            if (currentApprefId) {
              try {
                const refreshResponse = await applicationServices.getContractorWorkerDetails(currentApprefId);
                if (refreshResponse.success && refreshResponse.data?.formModel?.[0]) {
                  const data = refreshResponse.data.formModel[0];
                  const existingSupervisors = data.supervisorLicence_Backlog || [];
                  const existingWiremans = data.wiremanLicence_Backlog || [];
                  
                  setExistingSupervisorsFromAPI(existingSupervisors);
                  setExistingWiremansFromAPI(existingWiremans);
                  console.log('🔄 [WIREMAN] Data refreshed after wireman deletion');
                }
              } catch (refreshError) {
                console.warn('⚠️ [WIREMAN] Could not refresh data after deletion:', refreshError);
              }
            }
            
            setSaveSuccess(getSuccessMessage('wireman', 'delete'));
            setTimeout(() => setSaveSuccess(null), 3000);
          } else {
            throw new Error(response.message || 'Failed to delete wireman');
          }
        } catch (error) {
          console.error('❌ [WIREMAN] Error deleting wireman:', error);
          setSaveError(getErrorMessage('wireman', 'delete'));
        }
      }
    });
  };

  // ✅ 8. SAVE & NEXT LOGIC - Validate completion requirements and navigate (Angular parity)
  const handleSaveAndNext = async () => {
    console.log('� [REACT-SAVE] ===== SAVE & CONTINUE BUTTON CLICKED =====');
    console.log('🚀 [REACT-SAVE] Function: handleSaveAndNext() triggered');
    console.log('🚀 [REACT-SAVE] Current route URL:', location.pathname + location.search);
    console.log('🚀 [REACT-SAVE] Timestamp:', new Date().toISOString());
    
    console.log('📊 [REACT-SAVE] STEP 1: Data State Analysis');
    console.log('📊 [REACT-SAVE] Supervisors count:', supervisorsList.length);
    console.log('📊 [REACT-SAVE] Wiremans count:', wiremansList.length);
    console.log('📊 [REACT-SAVE] Working areas count:', applicationContext?.workingAreaList?.length || 0);
    
    console.log('�💾 [SAVE_AND_NEXT] Starting validation...');
    console.log('💾 [SAVE_AND_NEXT] Data counts:', {
      supervisors: supervisorsList.length,
      wiremans: wiremansList.length,
      workingAreas: applicationContext?.workingAreaList?.length || 0
    });
    
    // STEP 1: EXACT COUNT VALIDATION (Critical Logic - Angular parity)
    const workingAreaCount = applicationContext?.workingAreaList?.length || 0;
    const exactCountValidation = (
      supervisorsList.length === workingAreaCount && 
      wiremansList.length === workingAreaCount
    );
    
    console.log('💾 [SAVE_AND_NEXT] Exact count validation:', {
      supervisorsMatch: supervisorsList.length === workingAreaCount,
      wiremansMatch: wiremansList.length === workingAreaCount,
      overallPass: exactCountValidation
    });
    
    if (!exactCountValidation) {
      console.log('❌ [SAVE_AND_NEXT] Count validation failed - Angular parity');
      SweetAlert.fire({ 
        icon: 'error', 
        text: "Please complete Supervisor and Wireman list" 
      });
      return;
    }
    
    // STEP 2: EXPIRED LICENSE EXTRACTION (Angular parity)
    const expiredSupervisorLicences = supervisorsList
      .filter((item: any) => item.licenceExpired)
      .map((item: any) => item.licenceNo);  // ✅ Extract licenceNo only
    
    const expiredWiremanLicences = wiremansList
      .filter((item: any) => item.licenceExpired)
      .map((item: any) => item.licenceNo);  // ✅ Extract licenceNo only
    
    console.log('💾 [SAVE_AND_NEXT] Expired licenses check:', {
      expiredSupervisors: expiredSupervisorLicences,
      expiredWiremans: expiredWiremanLicences
    });
    
    // STEP 3: EXPIRED LICENSE VALIDATION (Angular parity)
    if (expiredSupervisorLicences.length > 0 || expiredWiremanLicences.length > 0) {
      console.log('❌ [SAVE_AND_NEXT] Expired licenses found, blocking navigation');
      
      // STEP 3A: BUILD STYLED ERROR MESSAGE (Angular parity)
      const expiredLicencesMessage = `
        ${expiredSupervisorLicences.length > 0 ? 
          `Expired Supervisor Licences: <b style="color:#034078 ;">${expiredSupervisorLicences.join(', ')}</b>` : ''}
        <br>
        ${expiredWiremanLicences.length > 0 ? 
          `Expired Wireman Licences: <b style="color:#034078 ;">${expiredWiremanLicences.join(', ')}</b>` : ''}
      `;

      // STEP 3B: SHOW STYLED ALERT (Angular parity)
      SweetAlert.fire({
        title: "OOPS !",
        icon: 'error',
        html: `The following licences have expired:<br><hr>${expiredLicencesMessage}<hr> 
               <br><p>Please remove these expired licences and add new one to proceed.</p>`
      });
      return; // ✅ Stop execution
    }
    
    console.log('✅ [SAVE_AND_NEXT] All validations passed, building query parameters');
    
    try {
      // STEP 4: SUCCESS FLOW - BUILD QUERY PARAMETERS (React contractor-documents compatibility)
      console.log('🔧 [REACT-SAVE] STEP 4: Building query parameters');
      console.log('🔧 [REACT-SAVE] Application context data:', {
        appRefId: applicationContext?.appRefId,
        workingAreaList: applicationContext?.workingAreaList?.length,
        selectedDistricts: applicationContext?.selectedWorkingAreaDistrictsList?.length,
        contractorLicenceId: applicationContext?.contractorLicenceId,
        applicationContractorType: applicationContext?.applicationContractorType,
        applicationIsLocked: applicationContext?.applicationIsLocked,
        is30DaysCrossed: applicationContext?.is30DaysCrossed
      });
      
      // Use Angular-compatible Save & Next query builder
      const queryParams = ContractorPayloadBuilder.buildSaveAndNextQueryParams({
        appRefId: applicationContext?.appRefId || apprefId,
        contractorFormMode: applicationContext?.contractorFormMode || 'new',
        applicationIsLocked: applicationContext?.applicationIsLocked || false,
        applicationContractorType: applicationContext?.applicationContractorType || '',
        is30DaysCrossed: applicationContext?.is30DaysCrossed
      }, encryptionService);
      
      const queryString = new URLSearchParams(queryParams).toString();
      console.log('� [REACT-SAVE] Final query params count:', Object.keys(queryParams).length);
      console.log('🔧 [REACT-SAVE] Final query parameters:', Object.keys(queryParams));
      console.log('�💾 [SAVE_AND_NEXT] Navigating with complete query params count:', Object.keys(queryParams).length);
      console.log('💾 [SAVE_AND_NEXT] Query string preview:', queryString.substring(0, 100) + '...');
      
      // STEP 5: NAVIGATION
      console.log('🧭 [REACT-SAVE] STEP 5: Starting navigation');
      console.log('🧭 [REACT-SAVE] Target route: /dashboard/license/attachments');
      console.log('🧭 [REACT-SAVE] Navigation payload ready');
      console.log('🧭 [REACT-SAVE] Calling navigate...');
      
      // STEP 5: NAVIGATION (React route to attachments page using ContractorDocuments component)
      navigate(`/dashboard/license/attachments?${queryString}`);
      
      console.log('🧭 [REACT-SAVE] Navigation call completed');
      console.log('🚀 [REACT-SAVE] ===== SAVE FUNCTION COMPLETED =====');
      
    } catch (error) {
      console.error('❌ [REACT-SAVE] Error building query params:', error);
      console.error('❌ [SAVE_AND_NEXT] Error building query params:', error);
      SweetAlert.fire({ 
        icon: 'error', 
        text: 'Failed to navigate to next page. Please try again.' 
      });
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
                      formControlName: 'licenceDocument',
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
                      formControlName: 'panNoDocument',
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
                      formControlName: 'licenceDocument',
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
                      formControlName: 'panNoDocument',
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
                variant={applicationContext?.applicationIsLocked ? "danger" : "primary"}
                onClick={() => {
                  console.log('🔘 [REACT-SAVE] ===== SAVE & CONTINUE BUTTON CLICKED =====');
                  console.log('🔘 [REACT-SAVE] Button clicked, calling handleSaveAndNext()');
                  handleSaveAndNext();
                }}
                className="btn-navigation"
                disabled={applicationContext?.applicationIsLocked || isAddingSupervisor || isAddingWireman}
              >
                {applicationContext?.applicationIsLocked ? (
                  <>
                    Application Locked
                    <i className="fa-solid fa-lock mx-1"></i>
                  </>
                ) : isAddingSupervisor || isAddingWireman ? (
                  <>
                    <i className="fa fa-spinner fa-spin me-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    Save & Next
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
