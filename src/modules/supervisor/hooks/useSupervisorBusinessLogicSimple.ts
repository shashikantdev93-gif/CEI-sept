/**
 * Supervisor Business Logic Hook - Simplified Version
 * Phase 2 - Modular Architecture
 * 
 * This hook consolidates existing supervisor hooks into a single business logic layer
 * while preserving 100% of the original component interface and functionality.
 */

import { useState, useEffect } from 'react';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { useContractorForm } from '../../../hooks/useContractorForm';
import { useSupervisorValidation } from '../../../hooks/useSupervisorValidation';
import { useSupervisorData } from '../../../hooks/useSupervisorData';
import { useSupervisorPageData } from '../../../hooks/contractor/useSupervisorPageData';
import encryptionService from '../../../lib/encryptionService';
import SweetAlert from 'sweetalert2';

export const useSupervisorBusinessLogic = () => {
  const navigate = useNavigate();
  const location = useRouterLocation();
  
  // ===== APPLICATION CONTEXT STATE (MATCHING ORIGINAL COMPONENT) =====
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
  
  // Processing states (matching original component)
  const [existingSupervisorsFromAPI, setExistingSupervisorsFromAPI] = useState<any[]>([]);
  const [existingWiremansFromAPI, setExistingWiremansFromAPI] = useState<any[]>([]);
  
  // Offline/Online toggle (matching original component)
  const [isSupervisorOffline, setIsSupervisorOffline] = useState(true);
  const [isWiremanOffline, setIsWiremanOffline] = useState(true);
  
  // ===== INTEGRATE ALL EXISTING HOOKS (EXACT MATCH) =====
  
  // Form setup & validation
  const supervisorValidationHook = useSupervisorValidation();

  // Data management hooks
  const supervisorDataHook = useSupervisorData();

  // Page-level data management
  const supervisorPageDataHook = useSupervisorPageData();

  // Application workflow integration
  const contractorFormHook = useContractorForm();

  // ===== QUERY PARAMETER PROCESSING (MATCHING ORIGINAL) =====
  useEffect(() => {
    const processQueryParameters = async () => {
      console.log('🔍 [SUPERVISOR-INIT] ===== PROCESSING QUERY PARAMETERS =====');
      
      try {
        const urlParams = new URLSearchParams(location.search);
        console.log('🔍 [SUPERVISOR-INIT] URL params:', Object.fromEntries(urlParams));
        
        if (urlParams.size > 0) {
          const encryptedWorkingAreaList = urlParams.get('workingAreaList');
          const encryptedFormMode = urlParams.get('formMode');
          const encryptedSelectedDistricts = urlParams.get('selectedWorkingAreaDistrictsList');
          const encryptedAppRefId = urlParams.get('appRefId');
          const encryptedContractorLicenceId = urlParams.get('contractorLicenceId');
          const encryptedApplicationContractorType = urlParams.get('applicationContractorType');
          const encryptedApplicationIsLocked = urlParams.get('applicationIsLocked');
          const encryptedRenewAppId = urlParams.get('renewAppId');
          const encryptedIs30DaysCrossed = urlParams.get('is30DaysCrossed');

          // Decrypt parameters (matching original component logic)
          const workingAreaList = encryptedWorkingAreaList ? 
            JSON.parse(encryptionService.decrypt(encryptedWorkingAreaList)) : [];
          const contractorFormMode = encryptedFormMode ? 
            encryptionService.decrypt(encryptedFormMode) : '';
          const selectedWorkingAreaDistrictsList = encryptedSelectedDistricts ? 
            JSON.parse(encryptionService.decrypt(encryptedSelectedDistricts)) : [];
          const appRefId = encryptedAppRefId ? 
            parseInt(encryptionService.decrypt(encryptedAppRefId)) : 0;
          const contractorLicenceId = encryptedContractorLicenceId ? 
            parseInt(encryptionService.decrypt(encryptedContractorLicenceId)) : 0;
          const applicationContractorType = encryptedApplicationContractorType ? 
            encryptionService.decrypt(encryptedApplicationContractorType) : '';
          const applicationIsLocked = encryptedApplicationIsLocked ? 
            JSON.parse(encryptionService.decrypt(encryptedApplicationIsLocked)) : false;
          const renewAppId = encryptedRenewAppId ? 
            parseInt(encryptionService.decrypt(encryptedRenewAppId)) : undefined;
          const is30DaysCrossed = encryptedIs30DaysCrossed ? 
            JSON.parse(encryptionService.decrypt(encryptedIs30DaysCrossed)) : undefined;

          console.log('✅ [SUPERVISOR-INIT] Decrypted parameters successfully');
          
          // Set application context (exact match to original)
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
          
        } else {
          console.log('⚠️ [SUPERVISOR-INIT] No query parameters found');
        }
        
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
    };

    processQueryParameters();
  }, [location.search, navigate]);

  // ===== RETURN EXACTLY WHAT THE ORIGINAL COMPONENT EXPECTS =====
  return {
    // ===== APPLICATION CONTEXT (MATCHING ORIGINAL) =====
    applicationContext,
    setApplicationContext,
    
    // Processing states
    existingSupervisorsFromAPI,
    setExistingSupervisorsFromAPI,
    existingWiremansFromAPI, 
    setExistingWiremansFromAPI,
    
    // Offline/Online toggle
    isSupervisorOffline, 
    setIsSupervisorOffline,
    isWiremanOffline, 
    setIsWiremanOffline,
    
    // ===== ALL SUPERVISOR VALIDATION HOOK PROPERTIES (EXACT PASS-THROUGH) =====
    supervisorForm: supervisorValidationHook.supervisorForm,
    wiremanForm: supervisorValidationHook.wiremanForm,
    supervisorErrors: supervisorValidationHook.supervisorErrors,
    wiremanErrors: supervisorValidationHook.wiremanErrors,
    setSupervisorForm: supervisorValidationHook.setSupervisorForm,
    setWiremanForm: supervisorValidationHook.setWiremanForm,
    validateSupervisorForm: supervisorValidationHook.validateSupervisorForm,
    validateWiremanForm: supervisorValidationHook.validateWiremanForm,
    handleSupervisorFieldChange: supervisorValidationHook.handleSupervisorFieldChange,
    handleWiremanFieldChange: supervisorValidationHook.handleWiremanFieldChange,
    handleSupervisorCertificateChange: supervisorValidationHook.handleSupervisorCertificateChange,
    handleWiremanCertificateChange: supervisorValidationHook.handleWiremanCertificateChange,
    isValidatingSupervisor: supervisorValidationHook.isValidatingSupervisor,
    isValidatingWireman: supervisorValidationHook.isValidatingWireman,
    clearSupervisorOnlineErrors: supervisorValidationHook.clearSupervisorOnlineErrors,
    clearWiremanOnlineErrors: supervisorValidationHook.clearWiremanOnlineErrors,
    validateField: supervisorValidationHook.validateField,

    // ===== ALL SUPERVISOR DATA HOOK PROPERTIES (EXACT PASS-THROUGH) =====
    isAddingSupervisor: supervisorDataHook.isAddingSupervisor,
    isAddingWireman: supervisorDataHook.isAddingWireman,
    setIsAddingSupervisor: supervisorDataHook.setIsAddingSupervisor,
    setIsAddingWireman: supervisorDataHook.setIsAddingWireman,

    // ===== ALL SUPERVISOR PAGE DATA HOOK PROPERTIES (EXACT PASS-THROUGH) =====
    totalSupervisors: supervisorPageDataHook.totalSupervisors,
    totalWiremans: supervisorPageDataHook.totalWiremans,
    maxSupervisors: supervisorPageDataHook.maxSupervisors,
    maxWiremans: supervisorPageDataHook.maxWiremans,
    isLoading: supervisorPageDataHook.isLoading,
    hasExpiredSupervisors: supervisorPageDataHook.hasExpiredSupervisors,
    hasExpiredWiremans: supervisorPageDataHook.hasExpiredWiremans,
    refreshData: supervisorPageDataHook.refreshData,
    checkExpiryStatus: supervisorPageDataHook.checkExpiryStatus,

    // ===== CONTRACTOR FORM HOOK PROPERTIES (EXACT PASS-THROUGH) =====
    apprefId: contractorFormHook.apprefId,
    ensureApplicationExists: contractorFormHook.ensureApplicationExists
  };
};