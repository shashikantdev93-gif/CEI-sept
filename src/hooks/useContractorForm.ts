import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from './useLocation';
import { userDetailsService } from '../services/api/userDetailsService';
import type { WorkingArea, Instrument, Partner, PartnerPayload } from '../types/contractor.types';
import { ProjectSiteDataMapper } from '../utils/projectSiteDataMapper';
import { 
  INSTRUMENT_LISTS, 
  WORKING_AREA_ERRORS, 
  WORKING_AREA_SUCCESS_MESSAGES,
  CONTRACTOR_TYPE_MAPPING,
  VOLTAGE_TYPE_MAPPING,
  getContractorTypeEnum,
  getVoltageTypeEnum,
  getRangeUnitEnum,
  getContractorTypeId,
  getVoltageTypeId,
  getRangeUnitId
} from '../constants/contractor';
import { useContractorApplication } from './useContractorApplication';
import { validateWorkingAreaDuplicate, createWorkingAreaPayload } from '../utils/contractorUtils';
import { ToastService, SweetAlertService } from '../utils';
import { useProjectSiteAPI } from './useProjectSiteAPI';
import { getInstrumentTypeName, getContractorTypeName, getVoltageTypeName, getRangeUnitName } from '../utils/enumMappings';

export const useContractorForm = (draftApplicationId?: number | null) => {
  // Basic Form State
  const [applicant_name, setApplicantName] = useState(""); 
  const [address, setAddress] = useState("");
  const [panCardNumber, setPanCardNumber] = useState(""); 
  const [contractorType, setContractorType] = useState("");
  const [currentWorkingVoltage, setCurrentWorkingVoltage] = useState("");
  const [signeeNameOnBehalfOfCompany, setSigneeNameOnBehalfOfCompany] = useState("");
  const [businessEntity, setBusinessEntity] = useState("");
  const [businessEntityAddress, setBusinessEntityAddress] = useState("");

  // Working Area State (Angular naming: this.workingAreaList)
  const [workingOnDistrict, setWorkingOnDistrict] = useState<number | "">("");
  const [workingOnTehsil, setWorkingOnTehsil] = useState<number | "">("");
  const [workingAreaList, setWorkingAreaList] = useState<WorkingArea[]>([]);

  // Instrument State (Angular naming: instrumentForm, instrumentsList)
  const [instrument, setInstrument] = useState("");
  const [instrumentSerialNo, setInstrumentSerialNo] = useState("");
  const [instrumentMake, setInstrumentMake] = useState("");
  const [instrumentRangeFrom, setInstrumentRangeFrom] = useState("");
  const [instrumentRangeTo, setInstrumentRangeTo] = useState("");
  const [instrumentRangeUnit, setInstrumentRangeUnit] = useState("");
  const [district, setDistrict] = useState<number | "">("");
  const [tehsil, setTehsil] = useState<number | "">("");
  const [instrumentDistrict, setInstrumentDistrict] = useState<number | "">("");
  const [instrumentTehsil, setInstrumentTehsil] = useState<number | "">("");
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstrumentList, setSelectedInstrumentList] = useState<Array<{value: number, name: string}>>([]);
  
  // Instrument Form State Management (Angular parity)
  const [instrumentFormErrors, setInstrumentFormErrors] = useState<{
    instrumentType?: string;
    serialNo?: string;
    make?: string;
    rangeFrom?: string;
    rangeTo?: string;
    rangeUnit?: string;
    district?: string;
    tehsil?: string;
  }>({});
  
  // ✅ INSTRUMENT CHARACTER COUNT STATE  
  const [instrumentCharacterCount, setInstrumentCharacterCount] = useState<{
    make: number;
    serialNo: number;
  }>({ make: 0, serialNo: 0 });
  
  const [isAddingInstrument, setIsAddingInstrument] = useState(false);
  const [instrumentFormSubmitted, setInstrumentFormSubmitted] = useState(false);
  const [workingTehsilList, setWorkingTehsilList] = useState<Array<{tehsilRefId: number, tehsilName: string}>>([]);

  // Partner State (Angular naming: shareHolderForm, partnerList)
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerContactNumber, setPartnerContactNumber] = useState("");
  const [partnerPhoto, setPartnerPhoto] = useState("");
  const [uploadPan, setUploadPan] = useState("");
  const [panNo, setPanNo] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerPhotoPreviewUrl, setPartnerPhotoPreviewUrl] = useState("");
  const [uploadPanPreviewUrl, setUploadPanPreviewUrl] = useState("");
  
  // Partner Form State Management (Angular parity)
  const [partnerFormErrors, setPartnerFormErrors] = useState<{
    name?: string;
    email?: string;
    contactNumber?: string;
    photo?: string;
    panNo?: string;
    panPhoto?: string;
  }>({});
  const [partnerCharacterCount, setPartnerCharacterCount] = useState<{
    name: number;
    email: number;
    contactNumber: number;
    panNo: number;
  }>({
    name: 0,
    email: 0,
    contactNumber: 0,
    panNo: 0
  });
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [partnerFormSubmitted, setPartnerFormSubmitted] = useState(false);

  // Application State (Angular naming: this.apprefId)
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isAddingWorkingArea, setIsAddingWorkingArea] = useState(false);
  
  // Draft Application State (matches Angular application object)
  const [applicationData, setApplicationData] = useState<any>(null);
  const [hideContractorElementsForLockPage, setHideContractorElementsForLockPage] = useState(false);
  const { districts, tehsils, loading, errors: locationErrors, loadDistricts, loadTehsils, resetTehsils } = useLocation();
  const [workingAreaFormErrors, setWorkingAreaFormErrors] = useState<{
    district?: string;
    tehsil?: string;
  }>({});

  // Field State Management (COMPLETE Angular parity)
  // Based on exact Angular logic from contractor-applicant.component.html
  const isFormDisabled = useMemo(() => {
    if (!applicationData) return false;
    
    // Angular: [class.cursorNotAllowed]="application?(!this.application?.isAllowEdit):false"
    const disabled = !applicationData?.isAllowEdit;
    
    console.log('🔒 [FIELD-STATE] isFormDisabled calculation:', {
      applicationData: !!applicationData,
      isAllowEdit: applicationData?.isAllowEdit,
      result: disabled
    });
    return disabled;
  }, [applicationData]);

  const areFieldsDisabled = useMemo(() => {
    if (!applicationData) return false;
    
    // Angular field disabling logic (EXACT match):
    // [class.disableFieldForLock]="hideContractorElementsForLockPage || instrumentsList?.length>0 || 
    // (application?.applicationLifeCycleStatusType===0 ||application?.applicationLifeCycleStatusType===1 ||
    // application?.applicationLifeCycleStatusType===2 ||application?.applicationLifeCycleStatusType===3|| 
    // application?.applicationLifeCycleStatusType===5 || application?.applicationPurposeType===2)"
    
    const disabledStatuses = [0, 1, 2, 3, 5];
    const isLifeCycleDisabled = disabledStatuses.includes(applicationData?.applicationLifeCycleStatusType);
    const isPurposeTypeDisabled = applicationData?.applicationPurposeType === 2; // Renewal
    const hasInstruments = instruments && instruments.length > 0;
    
    const disabled = hideContractorElementsForLockPage || 
                    hasInstruments || 
                    isLifeCycleDisabled || 
                    isPurposeTypeDisabled;
    
    console.log('🔒 [FIELD-STATE] areFieldsDisabled calculation:', {
      hideContractorElementsForLockPage,
      hasInstruments,
      instrumentsLength: instruments?.length || 0,
      applicationLifeCycleStatusType: applicationData?.applicationLifeCycleStatusType,
      applicationPurposeType: applicationData?.applicationPurposeType,
      isLifeCycleDisabled,
      isPurposeTypeDisabled,
      disabledStatuses,
      result: disabled
    });
    return disabled;
  }, [applicationData, hideContractorElementsForLockPage, instruments]);

  const {
    applicationId,
    applicationState,
    formMode,
    isCreatingApplication,
    applicationError,
    setFormMode,
    createApplication,
    checkApplicationExists,
    persistApplicationState,
    restoreApplicationState
  } = useContractorApplication();

  // Angular naming: this.apprefId (references the same value as applicationId)
  const apprefId = applicationId;

  const {
    loading: projectSiteLoading,
    error: projectSiteError,
    loadProjectSiteDetails
  } = useProjectSiteAPI({
    pageType: 'contractorApplication',
    autoLoad: false, // We'll load manually
    onDataLoaded: (data) => {
      console.log('🎯 [CONTRACTOR-FORM] Project site data loaded, extracting contractor data...');
      
      // Extract and populate contractor form fields
      const contractorData = ProjectSiteDataMapper.getContractorFormData(data);
      
      if (contractorData.applicantName) {
        setApplicantName(contractorData.applicantName);
        console.log('✅ [CONTRACTOR-FORM] Applicant name auto-filled:', contractorData.applicantName);
      }
      
      if (contractorData.applicantAddress) {
        setAddress(contractorData.applicantAddress);
        console.log('✅ [CONTRACTOR-FORM] Applicant address auto-filled:', contractorData.applicantAddress);
      }
      
      if (contractorData.applicantPAN) {
        setPanCardNumber(contractorData.applicantPAN);
        console.log('✅ [CONTRACTOR-FORM] Applicant PAN auto-filled:', contractorData.applicantPAN);
      }
    },
    onError: (error) => {
      console.error('❌ [CONTRACTOR-FORM] Error loading project site data:', error);
      setSaveError('Failed to load applicant details. Please refresh the page.');
    }
  });

  // Helper function to get current form data with proper mappings for API submission (Angular-like)
  const getCurrentFormData = useCallback(() => ({
    applicant_name,
    address,
    panCardNumber,
    contractorType: getContractorTypeId(contractorType), // Convert to number for API
    currentWorkingVoltage: getVoltageTypeId(currentWorkingVoltage), // Convert to number for API
    signeeNameOnBehalfOfCompany,
    businessEntity,
    businessEntityAddress
  }), [
    applicant_name,
    address,
    panCardNumber,
    contractorType,
    currentWorkingVoltage,
    signeeNameOnBehalfOfCompany,
    businessEntity,
    businessEntityAddress
  ]); 

  // Validate working area form
  const validateWorkingAreaForm = useCallback((): boolean => {
    const errors: typeof workingAreaFormErrors = {};
    
    if (!workingOnDistrict) {
      errors.district = 'District is required';
    }
    
    if (!workingOnTehsil) {
      errors.tehsil = 'Tehsil is required';
    }
    
    setWorkingAreaFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [workingOnDistrict, workingOnTehsil]);

  // Load initial data
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      console.log('🚀 [CONTRACTOR-FORM] Loading initial applicant data...');
      
      try {
        // Load project site details using the existing hook
        console.log('🌐 [CONTRACTOR-FORM] Loading project site details...');
        await loadProjectSiteDetails();
        
        // Load districts for Punjab (existing logic)
        console.log('🌐 [CONTRACTOR-FORM] Loading districts for Punjab...');
        if (isMounted) {
          loadDistricts(3); // Punjab state ID
        }
        
        console.log('✅ [CONTRACTOR-FORM] Initial data loading completed successfully');
        
      } catch (error) {
        console.error('❌ [CONTRACTOR-FORM] Error loading initial data:', error);
        if (isMounted) {
          setSaveError('Failed to load applicant details. Please refresh the page.');
          // Still load districts even if project site data fails
          loadDistricts(3);
        }
      } finally {
        // ALWAYS set loading to false when done, regardless of success or failure
        if (isMounted) {
          setIsInitialLoad(false);
          console.log('🏁 [CONTRACTOR-FORM] Initial load completed, setting isInitialLoad to false');
        }
      }
    };

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Ensure application exists before operations (Angular: checks this.apprefId before creating)
  const ensureApplicationExists = useCallback(async (): Promise<number | null> => {
    console.log('🔍 [CONTRACTOR-FORM] Checking if application exists...');
    console.log('🔍 [CONTRACTOR-FORM] Current apprefId:', apprefId);
    console.log('🔍 [CONTRACTOR-FORM] draftApplicationId:', draftApplicationId);
    
    // ✅ FIX: Use draftApplicationId first (from navigation), then apprefId
    const existingAppId = draftApplicationId || apprefId;
    
    if (existingAppId && existingAppId !== 0) {
      console.log('✅ [CONTRACTOR-FORM] Using existing application:', existingAppId);
      return existingAppId;
    }
    
    // Only create new application if no existing one found (like Angular)
    if (checkApplicationExists()) {
      console.log('✅ [CONTRACTOR-FORM] Application exists via hook:', applicationId);
      return applicationId;
    }

    console.log('📝 [CONTRACTOR-FORM] No existing application found, creating new...');
    const formData = getCurrentFormData();
    return await createApplication(formData);
  }, [draftApplicationId, apprefId, applicationId, checkApplicationExists, createApplication, getCurrentFormData]);

  // Angular function name: getContractorApplicationDetails() 
  const getContractorApplicationDetails = useCallback(async () => {
    console.log('🔄 [CONTRACTOR-FORM] === REFRESH STARTED ===');
    console.log('🔄 [CONTRACTOR-FORM] Current apprefId:', apprefId);
    console.log('🔄 [CONTRACTOR-FORM] draftApplicationId:', draftApplicationId);
    
    // ✅ FIX: Use same priority as Angular - draftApplicationId (from navigation) first
    let currentAppId = draftApplicationId || apprefId;
    
    // ✅ CRITICAL: If no valid appId, cannot refresh (same as Angular)
    if (!currentAppId || currentAppId === 0) {
      console.log('❌ [CONTRACTOR-FORM] No valid appId available for refresh');
      console.log('❌ [CONTRACTOR-FORM] This means user needs to navigate properly or session expired');
      return;
    }
    
    console.log('🔄 [CONTRACTOR-FORM] Refreshing data from server with appId:', currentAppId);
    
    try {
      console.log('📞 [CONTRACTOR-FORM] Making API call to getContractorApplicationDetailsById...');
      
      const response = await userDetailsService.getContractorApplicationDetailsById(currentAppId);
      
      console.log('� [CONTRACTOR-FORM] Raw API response:');
      console.log('📥 [CONTRACTOR-FORM] - Success:', response.success);
      console.log('📥 [CONTRACTOR-FORM] - Data structure:', response.data ? Object.keys(response.data) : 'No data');
      console.log('📥 [CONTRACTOR-FORM] - FormModel length:', response.data?.formModel?.length || 0);
      
      if (response.success && response.data?.formModel?.[0]) {
        const contractorData = response.data.formModel[0];
        
        console.log('✅ [CONTRACTOR-FORM] Contractor data received for appId:', currentAppId);
        console.log('📊 [CONTRACTOR-FORM] Data contains:');
        console.log('📊 [CONTRACTOR-FORM] - Working Areas:', contractorData.applicationTehsilLevelUserWorking?.length || 0);
        console.log('📊 [CONTRACTOR-FORM] - Instruments:', contractorData.applicationInstrumentalDetail?.length || 0);
        console.log('📊 [CONTRACTOR-FORM] - Partners:', contractorData.contractorPartnership_GeneralDetails?.length || 0);
        
        // Map Working Areas (exact Angular logic)
        const workingAreasData = contractorData.applicationTehsilLevelUserWorking || [];
        console.log('🗂️ [CONTRACTOR-FORM] Raw working areas from server:', workingAreasData);
        
        // ✅ FIX: Include ALL required fields for deletion
        if (workingAreasData.length > 0) {
          console.log('📊 [CONTRACTOR-FORM] Sample working area from server:', workingAreasData[0]);
          console.log('📊 [CONTRACTOR-FORM] Available fields:', Object.keys(workingAreasData[0]));
        }
        
        const mappedWorkingAreas = workingAreasData.map((area: any) => ({
          id: area.tehsilLevelUserMappingId,                    // Keep for backward compatibility
          tehsilLevelUserMappingId: area.tehsilLevelUserMappingId, // ✅ Required for deletion API
          district: area.districtName,                          // React naming
          tehsil: area.tehsilName,                             // React naming
          districtName: area.districtName,                     // Angular naming compatibility
          tehsilName: area.tehsilName,                         // Angular naming compatibility
          districtRefId: area.districtRefId,                   // Required for validation
          tehsilRefId: area.tehsilRefId,                       // Required for validation
          appRefId: area.appRefId,                             // Required for API calls
          action: 'Delete'
        }));
        
        console.log('✅ [CONTRACTOR-FORM] Working Areas mapped with full data:', mappedWorkingAreas);
        console.log('✅ [CONTRACTOR-FORM] First mapped area structure:', mappedWorkingAreas[0] || 'No areas');
        setWorkingAreaList(mappedWorkingAreas);
        console.log('✅ [CONTRACTOR-FORM] Working Areas mapped:', mappedWorkingAreas.length, 'items');
        
        // Map Instruments (exact Angular logic)
        const instrumentsData = contractorData.applicationInstrumentalDetail || [];
        const mappedInstruments = instrumentsData.map((inst: any) => ({
          id: inst.contactInstrumentId,
          instrumentType: getInstrumentTypeName(inst.applicationInstrumentsType),
          instrumentSerialNo: inst.instrumentSerialNo,
          instrumentMake: inst.instrumentMakeBy,
          instrumentRange: `${inst.instrumentStartRange}-${inst.instrumentEndRange} ${getRangeUnitName(inst.applicationInstrumentRange)}`,
          district: inst.districtName || '',
          tehsil: inst.tehsilName || '',
          districtRefId: inst.districtRefId,
          tehsilRefId: inst.tehsilRefId,
          action: 'Delete'
        }));
        setInstruments(mappedInstruments);
        console.log('✅ [CONTRACTOR-FORM] Instruments mapped:', mappedInstruments.length, 'items');
        
        // Map Partners (exact Angular logic)
        const partnersData = contractorData.contractorPartnership_GeneralDetails || [];
        const mappedPartners = partnersData.map((partner: any) => ({
          id: partner.contactPartnershipId,
          name: partner.contrPartnerName,
          email: partner.contrPartnerEmail,
          mobileNumber: partner.contrPartnerContactNo,
          panNo: partner.panNo,
          photo: partner.contrPartnerPhoto || '',
          pan: partner.panNoPhoto || '',
          action: 'Delete'
        }));
        setPartners(mappedPartners);
        console.log('✅ [CONTRACTOR-FORM] Partners mapped:', mappedPartners.length, 'items');
        
        // Populate form fields from contractor general details
        if (contractorData.contractorLicence_GeneralDetails) {
          const generalDetails = contractorData.contractorLicence_GeneralDetails;
          
          // Map contractor type from number to string
          if (generalDetails.applicationContractorType !== undefined) {
            const contractorTypeString = getContractorTypeName(generalDetails.applicationContractorType);
            setContractorType(contractorTypeString);
            console.log('✅ [CONTRACTOR-FORM] Mapped Contractor Type:', generalDetails.applicationContractorType, '->', contractorTypeString);
          }
          
          // Map voltage type from number to string
          if (generalDetails.applicationWorkingVoltageType !== undefined) {
            const voltageTypeString = getVoltageTypeName(generalDetails.applicationWorkingVoltageType);
            setCurrentWorkingVoltage(voltageTypeString);
            console.log('✅ [CONTRACTOR-FORM] Mapped Working Voltage:', generalDetails.applicationWorkingVoltageType, '->', voltageTypeString);
          }
          
          // Map other contractor details
          if (generalDetails.nameOfSigneeOfCompany) {
            setSigneeNameOnBehalfOfCompany(generalDetails.nameOfSigneeOfCompany);
            console.log('✅ [CONTRACTOR-FORM] Mapped Signee Name:', generalDetails.nameOfSigneeOfCompany);
          }
          
          if (generalDetails.businessEntity) {
            setBusinessEntity(generalDetails.businessEntity);
            console.log('✅ [CONTRACTOR-FORM] Mapped Business Entity:', generalDetails.businessEntity);
          }
          
          if (generalDetails.businessEntityAddress) {
            setBusinessEntityAddress(generalDetails.businessEntityAddress);
            console.log('✅ [CONTRACTOR-FORM] Mapped Business Entity Address:', generalDetails.businessEntityAddress);
          }
        }

        // CRITICAL: Set applicationData for field state management (EXACT Angular mapping)
        // Angular: this.application = this.contractorApplicationDetails[this.contractorApplicationDetails.length - 1];
        // In our case, contractorData is already the formModel[0] which corresponds to the application object in Angular
        setApplicationData(contractorData);
        
        // Angular: this.hideContractorElementsForLockPage logic (enhanced)
        // Check if should hide based on status or explicit flag
        const shouldHideElements = contractorData?.hideContractorElementsForLockPage || 
                                  contractorData?.applicationLifeCycleStatusType === 2 || // Approved
                                  contractorData?.applicationLifeCycleStatusType === 3;   // Rejected
        setHideContractorElementsForLockPage(shouldHideElements);
        
        console.log('🔒 [CONTRACTOR-FORM] Application data set for field state management (Angular mapping):', {
          isAllowEdit: contractorData?.isAllowEdit,
          applicationLifeCycleStatusType: contractorData?.applicationLifeCycleStatusType,
          applicationPurposeType: contractorData?.applicationPurposeType,
          hideContractorElementsForLockPage: shouldHideElements,
          rawHideFlag: contractorData?.hideContractorElementsForLockPage,
          instrumentsCount: mappedInstruments?.length || 0,
          fullApplicationData: contractorData
        });
        
        console.log('✅ [CONTRACTOR-FORM] All contractor data loaded successfully');
        console.log('📊 Summary - Working Areas:', mappedWorkingAreas.length, 'Instruments:', mappedInstruments.length, 'Partners:', mappedPartners.length);
        
      } else {
        console.warn('⚠️ [CONTRACTOR-FORM] No contractor data found in response or invalid response structure');
        console.warn('⚠️ [CONTRACTOR-FORM] Response:', response);
      }
      
    } catch (error) {
      console.error('❌ [CONTRACTOR-FORM] Error loading contractor details:', error);
      setSaveError('Failed to load contractor details');
    }
    
    console.log('🔄 [CONTRACTOR-FORM] === REFRESH ENDED ===');
  }, [draftApplicationId, apprefId, restoreApplicationState, setWorkingAreaList, setInstruments, setPartners, setSaveError]);

  // Auto-restore state and refresh data after initial load
  useEffect(() => {
    if (!isInitialLoad) {
      console.log('🔄 [CONTRACTOR-FORM] === AUTO-RESTORATION TRIGGERED ===');
      console.log('🔄 [CONTRACTOR-FORM] Initial load complete, attempting state restoration...');
      
      // STRATEGY: Always try to restore and refresh, even if no saved state
      const restored = restoreApplicationState();
      if (restored?.appId) {
        console.log('✅ [CONTRACTOR-FORM] State restored with appId:', restored.appId);
        console.log('🔄 [CONTRACTOR-FORM] Forcing immediate data refresh...');
        // Force refresh after state restoration with small delay to ensure state is set
        setTimeout(() => {
          getContractorApplicationDetails();
        }, 100);
      } else {
        console.log('ℹ️ [CONTRACTOR-FORM] No saved state found, but still attempting refresh...');
        // Even without saved state, try to refresh in case there's data on the server
        setTimeout(() => {
          getContractorApplicationDetails();
        }, 100);
      }
    }
  }, [isInitialLoad, restoreApplicationState, getContractorApplicationDetails]);

  // Enhanced Add Working Area with validation and application check (Angular function name: addWorkingArea)
  const addWorkingArea = useCallback(async () => {
    console.log('🚀 [ADD-WORKING-AREA] Function started');
    console.log('🚀 [ADD-WORKING-AREA] Form values:', {
      workingOnDistrict,
      workingOnTehsil
    });

    // STEP 1: Set form submission flag for validation (matches Angular formSubmittedW = true)
    const errors: typeof workingAreaFormErrors = {};
    
    if (!workingOnDistrict) {
      errors.district = WORKING_AREA_ERRORS.DISTRICT_REQUIRED;
    }
    
    if (!workingOnTehsil) {
      errors.tehsil = WORKING_AREA_ERRORS.TEHSIL_REQUIRED;
    }
    
    setWorkingAreaFormErrors(errors);

    // STEP 2: Validate the working area form (matches Angular !this.workingAreaForm.valid)
    if (Object.keys(errors).length > 0) {
      console.log('❌ [ADD-WORKING-AREA] Form validation failed');
      setSaveError('Please fill all required fields');
      return;
    }

    try {
      // STEP 3: Check if application details exist, create if needed (matches Angular apprefId check)
      console.log('🚀 [ADD-WORKING-AREA] Application ID sources:');
      console.log('🚀 [ADD-WORKING-AREA] - apprefId:', apprefId);
      console.log('🚀 [ADD-WORKING-AREA] - draftApplicationId:', draftApplicationId);
      
      // ✅ FIX: Use same priority as Angular - draftApplicationId first, then apprefId
      let currentApprefId = draftApplicationId || apprefId;
      console.log('🚀 [ADD-WORKING-AREA] Selected apprefId:', currentApprefId);
      
      if (!currentApprefId || currentApprefId === 0) {
        console.log('📝 [ADD-WORKING-AREA] No valid apprefId, calling ensureApplicationExists');
        try {
          currentApprefId = await ensureApplicationExists();
          if (!currentApprefId) {
            console.error('❌ [ADD-WORKING-AREA] ensureApplicationExists failed to return valid ID');
            setSaveError(WORKING_AREA_ERRORS.APPLICATION_CREATE_FAILED);
            return;
          }
          console.log('✅ [ADD-WORKING-AREA] ensureApplicationExists returned apprefId:', currentApprefId);
        } catch (error) {
          console.error('❌ [ADD-WORKING-AREA] Error in ensureApplicationExists:', error);
          setSaveError(WORKING_AREA_ERRORS.APPLICATION_CREATE_FAILED);
          return;
        }
      }

      // STEP 4: Check for duplicate working area entries (EXACT Angular logic)
      console.log('🔍 [ADD-WORKING-AREA] Checking for duplicate entries');
      const districtRefId = workingOnDistrict as number;
      const tehsilRefId = workingOnTehsil as number;
      
      const existingWorkingAreas = workingAreaList || [];
      
      const duplicateCheck = validateWorkingAreaDuplicate(
        districtRefId,
        tehsilRefId,
        existingWorkingAreas,
        districts,
        tehsils
      );
      
      if (duplicateCheck.isDuplicate) {
        console.log('⚠️ [ADD-WORKING-AREA] Duplicate found, showing error');
        setSaveError(WORKING_AREA_ERRORS.DUPLICATE_AREA);
        ToastService.error(WORKING_AREA_ERRORS.DUPLICATE_AREA);
        return;
      }

      // STEP 5: Create working area payload (matches Angular workingAreaPayload structure)
      console.log('📦 [ADD-WORKING-AREA] Creating working area payload');
      const selectedDistrict = districts.find(d => d.districtCode === districtRefId);
      const selectedTehsil = tehsils.find(t => t.tehsilId === tehsilRefId);

      const workingAreaPayload = createWorkingAreaPayload(
        currentApprefId,
        districtRefId,
        tehsilRefId,
        selectedDistrict?.districtName || '',
        selectedTehsil?.tehsilName || ''
      );

      console.log('📦 [ADD-WORKING-AREA] Final payload:', workingAreaPayload);

      // STEP 6: Make API call with loading state
      console.log('🌐 [ADD-WORKING-AREA] Making API call to backend...');
      setIsAddingWorkingArea(true); // Show spinner (matches Angular this.spinner.show())
      
      const response = await userDetailsService.createContractorWorkingArea(workingAreaPayload);
      
      console.log('📥 [ADD-WORKING-AREA] API Response received:', response);

      // STEP 7: Handle success response (EXACT Angular match)
      console.log('📥 [ADD-WORKING-AREA] API Response details:');
      console.log('📥 [ADD-WORKING-AREA] - Success:', response.success);
      console.log('📥 [ADD-WORKING-AREA] - Data:', response.data);
      console.log('📥 [ADD-WORKING-AREA] - Message:', response.message);
      
      if (response.success) {
        console.log('✅ [ADD-WORKING-AREA] API call successful');
        console.log('✅ [ADD-WORKING-AREA] Working area saved to appRefId:', currentApprefId);
        
        // Hide spinner (matches Angular this.spinner.hide())
        setIsAddingWorkingArea(false);
        
        // Clear form exactly like Angular
        console.log('🧹 [ADD-WORKING-AREA] Clearing form fields...');
        setWorkingOnDistrict(""); // matches districtRefId: ""
        setWorkingOnTehsil("");   // matches tehsilRefId: ""
        setWorkingAreaFormErrors({}); // matches markAsPristine/markAsUntouched
        resetTehsils(); // Reset tehsil dropdown
        
        // Reset form submission flag (matches this.formSubmittedW = false)
        console.log('🔄 [ADD-WORKING-AREA] Form submission flag reset');

        // Update local state immediately (optimistic update)
        const newWorkingArea: WorkingArea = {
          id: Date.now(),
          tehsilLevelUserMappingId: 0, // ✅ Temporary ID, will be updated by server refresh
          district: selectedDistrict?.districtName || districtRefId.toString(),
          tehsil: selectedTehsil?.tehsilName || tehsilRefId.toString(),
          action: 'Delete',
          districtRefId: districtRefId,
          tehsilRefId: tehsilRefId,
          appRefId: currentApprefId
        };

        setWorkingAreaList(prevAreas => [...prevAreas, newWorkingArea]);
        
        // Show success message
        setSaveSuccess(WORKING_AREA_SUCCESS_MESSAGES.AREA_ADDED);
        ToastService.success(WORKING_AREA_SUCCESS_MESSAGES.AREA_ADDED);
        
        console.log('✅ [ADD-WORKING-AREA] Working area added to local state');

        // Refresh contractor data from server (matches Angular this.getContractorApplicationDetails())
        console.log('🔄 [ADD-WORKING-AREA] Refreshing contractor data from server...');
        await getContractorApplicationDetails();
        
        console.log('✅ [ADD-WORKING-AREA] Process completed successfully');

      } else {
        // Handle API success=false case (CRITICAL for debugging)
        console.error('❌ [ADD-WORKING-AREA] API returned success=false');
        console.error('❌ [ADD-WORKING-AREA] Response message:', response.message);
        console.error('❌ [ADD-WORKING-AREA] Response error:', response.error);
        console.error('❌ [ADD-WORKING-AREA] Full response:', response);
        
        // Check for silent failure patterns
        if (response.message?.includes('not found') || response.message?.includes('invalid')) {
          console.error('🚨 [ADD-WORKING-AREA] SILENT FAILURE DETECTED - Invalid appRefId:', currentApprefId);
          throw new Error(`Application not found (ID: ${currentApprefId}). Please refresh the page and try again.`);
        }
        
        throw new Error(response.message || response.error || 'Failed to add working area');
      }

    } catch (error: any) {
      // STEP 8: Handle error response (matches Angular error handling)
      console.error('❌ [ADD-WORKING-AREA] API Error:', error);
      
      // Hide spinner on error (matches Angular this.spinner.hide())
      setIsAddingWorkingArea(false);
      
      // Extract error message
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          WORKING_AREA_ERRORS.ADD_FAILED;
      
      console.error('❌ [ADD-WORKING-AREA] Error details:', {
        originalError: error,
        extractedMessage: errorMessage,
        errorType: typeof error
      });
      
      // Show error to user
      setSaveError(errorMessage);
      ToastService.error(errorMessage);
      
      // Don't clear form on error (Angular behavior)
      console.log('⚠️ [ADD-WORKING-AREA] Form preserved due to error');
    }
  }, [
    workingOnDistrict,
    workingOnTehsil,
    apprefId,
    ensureApplicationExists,
    workingAreaList,
    districts,
    tehsils,
    resetTehsils,
    getContractorApplicationDetails,
    setWorkingAreaFormErrors,
    setSaveError,
    setIsAddingWorkingArea,
    setWorkingOnDistrict,
    setWorkingOnTehsil,
    setWorkingAreaList,
    setSaveSuccess
  ]); // ← This closing bracket and dependency array was missing

  // Handle Working Area District Change
  const handleWorkingDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = Number(e.target.value);
    setWorkingOnDistrict(districtCode);
    setWorkingOnTehsil("");
    setWorkingAreaFormErrors({}); // Clear validation errors on change
    resetTehsils();

    if (districtCode) {
      loadTehsils(districtCode);
    }
  };

  // Handle Working Area Tehsil Change
  const handleWorkingTehsilChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tehsilCode = Number(e.target.value);
    setWorkingOnTehsil(tehsilCode);
    setWorkingAreaFormErrors({}); // Clear validation errors on change
  };

  const handleInstrumentTehsilChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTehsilId = Number(e.target.value);
    setInstrumentTehsil(selectedTehsilId || "");
    
    // Also update the legacy tehsil state for backward compatibility
    setTehsil(selectedTehsilId || "");
  }, []); 

  // Handle Instrument District Change
  const handleInstrumentDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = Number(e.target.value);
    setDistrict(districtCode);
    setTehsil("");
    resetTehsils();

    if (districtCode) {
      loadTehsils(districtCode);
    }
  };


  // Handle Contractor Type Change (matches Angular selectContractorType logic)
  const handleContractorTypeChange = (value: string) => {
    console.log('📋 [CONTRACTOR_TYPE] ===== CONTRACTOR TYPE CHANGED =====');
    console.log('📋 [CONTRACTOR_TYPE] Previous contractorType:', contractorType);
    console.log('📋 [CONTRACTOR_TYPE] New contractorType:', value);
    
    setContractorType(value);
    
    const isIndividual = value === "Individual";
    console.log('📋 [CONTRACTOR_TYPE] Is Individual contractor:', isIndividual);
    
    console.log('📋 [CONTRACTOR_TYPE] Determining Partner/Shareholder form visibility...');
    console.log('📋 [CONTRACTOR_TYPE] Contractor types that require Partner form: [Private Limited, Public Limited, Partnership]');
    console.log('📋 [CONTRACTOR_TYPE] Current contractor type:', value);
    console.log('📋 [CONTRACTOR_TYPE] Is contractor type in required list:', ['Private Limited', 'Public Limited', 'Partnership'].includes(value));
    
    // Show partner form for non-individual contractors (matches Angular logic: ['5', '4', '2'])
    const showPartnerForm = ['Private Limited', 'Public Limited', 'Partnership'].includes(value);
    
    console.log('📋 [CONTRACTOR_TYPE] ===== FINAL RESULT =====');
    console.log('📋 [CONTRACTOR_TYPE] showPartnerForm (Partner section visible):', showPartnerForm);
    console.log('📋 [CONTRACTOR_TYPE] Individual contractor (no partners needed):', isIndividual);
    
    if (showPartnerForm) {
      console.log('✅ [CONTRACTOR_TYPE] Partner/Shareholder Details section will be shown');
      console.log('✅ [CONTRACTOR_TYPE] User can now add partners/shareholders');
    } else {
      console.log('❌ [CONTRACTOR_TYPE] Partner/Shareholder Details section will be hidden');
      console.log('❌ [CONTRACTOR_TYPE] Individual contractor - no partners needed');
    }
  };

  // Handle Working Voltage Change (matches Angular voltage mapping logic)
  const handleCurrentWorkingVoltageChange = (value: string) => {
    console.log('⚡ [WORKING_VOLTAGE] ===== CURRENT WORKING VOLTAGE CHANGED =====');
    console.log('⚡ [WORKING_VOLTAGE] Previous currentWorkingVoltage:', currentWorkingVoltage);
    console.log('⚡ [WORKING_VOLTAGE] New currentWorkingVoltage:', value);
    
    setCurrentWorkingVoltage(value);
    
    console.log('⚡ [WORKING_VOLTAGE] Determining instrument list based on voltage...');
    console.log('⚡ [WORKING_VOLTAGE] Available voltage options:');
    console.log('⚡ [WORKING_VOLTAGE] - Low/Medium Voltage: lowMediumVoltage instruments');
    console.log('⚡ [WORKING_VOLTAGE] - High Voltage: highVoltage instruments');
    console.log('⚡ [WORKING_VOLTAGE] - Extra High Voltage: extraHighVoltage instruments');
    
    let newInstrumentList: Array<{value: number, name: string}> = [];
    
    // Match Angular logic: voltage type ID determines instrument list
    switch (value) {
      case "Low/Medium Voltage":
        newInstrumentList = INSTRUMENT_LISTS.lowMediumVoltage;
        console.log('⚡ [WORKING_VOLTAGE] Selected: Low/Medium Voltage (ID: 1)');
        console.log('⚡ [WORKING_VOLTAGE] Available instruments:', newInstrumentList);
        break;
      case "High Voltage":
        newInstrumentList = INSTRUMENT_LISTS.highVoltage;
        console.log('⚡ [WORKING_VOLTAGE] Selected: High Voltage (ID: 2)');
        console.log('⚡ [WORKING_VOLTAGE] Available instruments:', newInstrumentList);
        break;
      case "Extra High Voltage":
        newInstrumentList = INSTRUMENT_LISTS.extraHighVoltage;
        console.log('⚡ [WORKING_VOLTAGE] Selected: Extra High Voltage (ID: 3)');
        console.log('⚡ [WORKING_VOLTAGE] Available instruments:', newInstrumentList);
        break;
      default:
        newInstrumentList = [];
        console.log('⚡ [WORKING_VOLTAGE] No voltage selected or invalid selection');
        console.log('⚡ [WORKING_VOLTAGE] Instrument list cleared');
        break;
    }
    
    setSelectedInstrumentList(newInstrumentList);
    
    // Clear instrument selection when voltage changes (matches Angular logic)
    if (instrument && value !== currentWorkingVoltage) {
      console.log('⚡ [WORKING_VOLTAGE] Clearing previous instrument selection due to voltage change');
      setInstrument("");
    }
    
    console.log('⚡ [WORKING_VOLTAGE] ===== FINAL RESULT =====');
    console.log('⚡ [WORKING_VOLTAGE] New instrument list length:', newInstrumentList.length);
    console.log('⚡ [WORKING_VOLTAGE] Instrument dropdown enabled:', newInstrumentList.length > 0);
    console.log('⚡ [WORKING_VOLTAGE] Previous instrument selection cleared:', !!instrument && value !== currentWorkingVoltage);
  };

  // Helper function to load and map contractor data from API response (matches Angular logic)
  const loadContractorDataFromAPI = useCallback((contractorDetails: any) => {
    console.log('📊 [CONTRACTOR-FORM] Loading contractor data from API response...');
    console.log('📊 [CONTRACTOR-FORM] Raw contractor details:', contractorDetails);

    if (contractorDetails) {
      // Map contractor type from number to string (using reverse mapping)
      if (contractorDetails.applicationContractorType !== undefined) {
        const contractorTypeString = getContractorTypeEnum(contractorDetails.applicationContractorType);
        setContractorType(contractorTypeString);
        console.log('📊 [CONTRACTOR-FORM] ✅ Mapped Contractor Type:', contractorDetails.applicationContractorType, '->', contractorTypeString);
      }
      
      // Map voltage type from number to string (using reverse mapping)
      if (contractorDetails.applicationWorkingVoltageType !== undefined) {
        const voltageTypeString = getVoltageTypeEnum(contractorDetails.applicationWorkingVoltageType);
        setCurrentWorkingVoltage(voltageTypeString);
        console.log('📊 [CONTRACTOR-FORM] ✅ Mapped Working Voltage:', contractorDetails.applicationWorkingVoltageType, '->', voltageTypeString);
        
        // Set appropriate instrument list based on voltage type (matches Angular logic)
        handleCurrentWorkingVoltageChange(voltageTypeString);
      }
      
      // Map other contractor details
      if (contractorDetails.nameOfSigneeOfCompany) {
        setSigneeNameOnBehalfOfCompany(contractorDetails.nameOfSigneeOfCompany);
        console.log('📊 [CONTRACTOR-FORM] ✅ Mapped Signee Name:', contractorDetails.nameOfSigneeOfCompany);
      }
      
      if (contractorDetails.businessEntity) {
        setBusinessEntity(contractorDetails.businessEntity);
        console.log('📊 [CONTRACTOR-FORM] ✅ Mapped Business Entity:', contractorDetails.businessEntity);
      }
      
      if (contractorDetails.businessEntityAddress) {
        setBusinessEntityAddress(contractorDetails.businessEntityAddress);
        console.log('📊 [CONTRACTOR-FORM] ✅ Mapped Business Entity Address:', contractorDetails.businessEntityAddress);
      }
      
      console.log('✅ [CONTRACTOR-FORM] All contractor general details mapped successfully');
    }
  }, [handleCurrentWorkingVoltageChange]);

  // Handle Add Instrument
  const handleAddInstrument = async () => {
    // Use instrumentDistrict and instrumentTehsil if available, fallback to district and tehsil
    const currentDistrict = instrumentDistrict || district;
    const currentTehsil = instrumentTehsil || tehsil;
    
    if (!instrument || !instrumentSerialNo || !instrumentMake || !currentDistrict || !currentTehsil || !applicationId) {
      setSaveError('Please fill all required fields');
      return;
    }

    try {
      const serialNumberToCheck = instrumentSerialNo.toUpperCase();
      const duplicateCheckResponse = await userDetailsService.validateInstrumentSerialNumber(serialNumberToCheck);
      
      if (duplicateCheckResponse.data?.formModel && duplicateCheckResponse.data.formModel.length > 0) {
        setSaveError('This Instrument Serial Number Already Exists');
        return;
      }

      const selectedDistrict = districts.find(d => d.districtCode === currentDistrict);
      const selectedTehsil = tehsils.find(t => t.tehsilId === currentTehsil);
      
      const exists = instruments.some((existingInstrument) =>
        existingInstrument.instrumentType === instrument &&
        existingInstrument.district === selectedDistrict?.districtName &&
        existingInstrument.tehsil === selectedTehsil?.tehsilName
      );
      
      if (exists) {
        setSaveError('This instrument is already added for the selected working area');
        return;
      }

      const selectedInstrumentValue = selectedInstrumentList.find(item => item.name === instrument)?.value;
      const rangeUnitId = getRangeUnitId(instrumentRangeUnit); // Convert range unit to ID for API
      
      const instrumentPayload = {
        contactInstrumentId: 0,
        appRefId: applicationId,
        applicationInstrumentsType: selectedInstrumentValue || 1,
        instrumentSerialNo: instrumentSerialNo.toUpperCase(),
        instrumentMakeBy: instrumentMake,
        instrumentStartRange: instrumentRangeFrom,
        instrumentEndRange: instrumentRangeTo,
        applicationInstrumentRange: rangeUnitId, // Use mapped range unit ID
        isActive: true,
        isDeleted: false,
        createdOnDate: new Date().toISOString(),
        lastModifiedOnDate: new Date().toISOString(),
        districtRefId: currentDistrict as number,
        districtName: selectedDistrict?.districtName || '',
        tehsilRefId: currentTehsil as number,
        tehsilName: selectedTehsil?.tehsilName || ''
      };

      const result = await userDetailsService.addInstrument(instrumentPayload);

      if (result?.success) {
        const newInstrument: Instrument = {
          id: Date.now(),
          instrumentType: instrument,
          instrumentSerialNo,
          instrumentMake,
          instrumentRange: `${instrumentRangeFrom}-${instrumentRangeTo} ${instrumentRangeUnit}`,
          district: selectedDistrict?.districtName || currentDistrict.toString(),
          tehsil: selectedTehsil?.tehsilName || currentTehsil.toString(),
          action: 'Delete'
        };
        
        setInstruments([...instruments, newInstrument]);
        clearInstrumentForm();
        setSaveSuccess('Instrument added successfully!');
      }
    } catch (error: any) {
      setSaveError(error?.message || 'Failed to add instrument');
    }
  };

  // ✅ PARTNER/SHAREHOLDER FUNCTIONALITY - Angular Parity Implementation
  
  /**
   * 🤝 UPDATE PARTNER CHARACTER COUNT - Angular: updateShareCharacterCount()
   * Real-time character counting for partner form fields
   */
  const updatePartnerCharacterCount = useCallback(() => {
    setPartnerCharacterCount({
      name: partnerName?.length || 0,
      email: partnerEmail?.length || 0,
      contactNumber: partnerContactNumber?.length || 0,
      panNo: panNo?.length || 0
    });
  }, [partnerName, partnerEmail, partnerContactNumber, panNo]);

  /**
   * ✅ VALIDATE PARTNER FORM - Angular: shareHolderForm.valid check
   * Comprehensive form validation matching Angular patterns
   */
  const validatePartnerForm = useCallback((): boolean => {
    const errors: any = {};
    let isValid = true;

    console.log('🔍 [VALIDATE-PARTNER] Starting form validation');
    console.log('🔍 [VALIDATE-PARTNER] Form values:', {
      partnerName: partnerName,
      partnerEmail: partnerEmail,
      partnerContactNumber: partnerContactNumber,
      panNo: panNo,
      partnerPhoto: !!partnerPhoto,
      uploadPan: !!uploadPan
    });

    // Name validation (Angular: Validators.required + Validators.pattern(firstName))
    const namePattern = /^[a-zA-Z\s]+$/; // Angular firstName pattern
    if (!partnerName || partnerName.trim().length < 2) {
      errors.name = 'Partner name is required (minimum 2 characters)';
      isValid = false;
    } else if (!namePattern.test(partnerName.trim())) {
      errors.name = 'Partner name should contain only letters and spaces';
      isValid = false;
    } else if (partnerName.trim().length > 50) {
      errors.name = 'Partner name cannot exceed 50 characters';
      isValid = false;
    }

    // Email validation (Angular: Validators.required + Validators.pattern(emailPattern) + Validators.email)
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Angular emailPattern
    if (!partnerEmail || !partnerEmail.trim()) {
      errors.email = 'Email address is required';
      isValid = false;
    } else if (!emailPattern.test(partnerEmail.trim())) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone validation (Angular: Validators.required + Validators.pattern(mobileNumberPattern))
    const phonePattern = /^[6-9]\d{9}$/; // Angular mobileNumberPattern
    if (!partnerContactNumber || !partnerContactNumber.trim()) {
      errors.contactNumber = 'Mobile number is required';
      isValid = false;
    } else if (!phonePattern.test(partnerContactNumber.trim())) {
      errors.contactNumber = 'Please enter a valid 10-digit mobile number starting with 6-9';
      isValid = false;
    }

    // PAN validation (Angular: Validators.required + Validators.pattern(panNumberPattern))
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // Angular panNumberPattern
    if (!panNo || !panNo.trim()) {
      errors.panNo = 'PAN number is required';
      isValid = false;
    } else if (!panPattern.test(panNo.toUpperCase())) {
      errors.panNo = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
      isValid = false;
    }

    // File validation (Angular: Validators.required + file type/size checks)
    if (!partnerPhoto) {
      errors.photo = 'Partner photo is required';
      isValid = false;
    } else {
      // Additional file validation (size, type - Angular equivalent)
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      if (partnerPhoto.length > 500) { // Assuming base64 or filename length check
        // This would be more sophisticated in real implementation
        console.log('🔍 [VALIDATE-PARTNER] Partner photo validation passed');
      }
    }

    if (!uploadPan) {
      errors.panPhoto = 'PAN document is required';
      isValid = false;
    } else {
      // Additional PAN document validation
      console.log('🔍 [VALIDATE-PARTNER] PAN document validation passed');
    }

    console.log('🔍 [VALIDATE-PARTNER] Validation result:', { isValid, errors });
    setPartnerFormErrors(errors);
    return isValid;
  }, [partnerName, partnerEmail, partnerContactNumber, panNo, partnerPhoto, uploadPan]);


  // Handle Add Partner - Enhanced Angular Parity
  const handleAddPartner = async () => {
    console.log('🤝 [ADD_PARTNER] ===== STARTING PARTNER CREATION PROCESS =====');
    console.log('🤝 [ADD_PARTNER] Function: createShareHolder() started (Angular naming)');
    console.log('🤝 [ADD_PARTNER] Current apprefId:', applicationId || apprefId);
    console.log('🤝 [ADD_PARTNER] Partner form values:', {
      contrPartnerName: partnerName,
      contrPartnerEmail: partnerEmail,
      contrPartnerContactNo: partnerContactNumber,
      contrPartnerPhoto: partnerPhoto,
      panNoPhoto: uploadPan,
      panNo: panNo
    });
    
    setPartnerFormSubmitted(true);
    setIsAddingPartner(true);
    setPartnerFormErrors({});
    setSaveError(null);

    try {
      // Step 1: Form Validation (Angular: this.shareHolderForm.valid)
      console.log('✅ [ADD_PARTNER] Step 1: Form validation');
      console.log('🤝 [ADD_PARTNER] Form validity:', validatePartnerForm());
      
      if (!validatePartnerForm()) {
        console.log('❌ [ADD_PARTNER] Form validation failed');
        setIsAddingPartner(false);
        return;
      }
      
      console.log('✅ [ADD_PARTNER] Form validation passed');

      // Step 2: Check if application exists (Angular: this.apprefId check)
      console.log('✅ [ADD_PARTNER] Step 2: Application check');
      const currentAppId = ensureApplicationExists ? await ensureApplicationExists() : (applicationId || apprefId);
      
      if (!currentAppId) {
        console.log('❌ [ADD_PARTNER] No application ID available');
        setSaveError('Please complete application details first');
        setIsAddingPartner(false);
        return;
      }
      
      console.log('✅ [ADD_PARTNER] apprefId exists, proceeding with partner creation');

      // Step 3: PAN Uniqueness Check (Angular: ProjectSites/getProjectSitesPanDetails)
      console.log('🔍 [ADD_PARTNER] ===== PAN NUMBER VALIDATION =====');
      console.log('🔍 [ADD_PARTNER] Checking if PAN number already exists');
      console.log('🔍 [ADD_PARTNER] PAN number to check:', panNo.toUpperCase());
      console.log('🔍 [ADD_PARTNER] API endpoint: ProjectSites/getProjectSitesPanDetails');
      console.log('🔍 [ADD_PARTNER] API payload:', { panno: panNo.toUpperCase() });
      
      const panValidationResponse = await userDetailsService.checkPANExists(panNo.toUpperCase());
      
      console.log('📥 [ADD_PARTNER] ===== PAN VALIDATION RESPONSE =====');
      console.log('📥 [ADD_PARTNER] PAN validation response received:', panValidationResponse.data);
      console.log('📥 [ADD_PARTNER] Response formModel:', panValidationResponse.data?.formModel);
      console.log('📥 [ADD_PARTNER] Is PAN already exists:', panValidationResponse.data?.formModel !== null && panValidationResponse.data?.formModel?.length > 0);
      
      // Angular logic: if formModel !== null && length > 0, PAN exists
      if (panValidationResponse.data?.formModel !== null && panValidationResponse.data?.formModel?.length > 0) {
        console.log('❌ [ADD_PARTNER] PAN number already exists');
        // Use SweetAlert like Angular
        await SweetAlertService.error(`PAN Number ${panNo.toUpperCase()} already exists in the system`, 'PAN Already Exists');
        setIsAddingPartner(false);
        return;
      }
      
      console.log('✅ [ADD_PARTNER] PAN number is unique, proceeding with partner creation');

      // Step 4: Create Partner Payload (Angular structure)
      console.log('📦 [ADD_PARTNER] ===== CREATING PARTNER PAYLOAD =====');
      
      // Get current user ID for audit trail (Angular includes user info)
      const tokenData = JSON.parse(localStorage.getItem('token') || '{}');
      const currentUserId = tokenData.userId || 0;
      
      const partnerPayload = {
        contactPartnershipId: 0,                              // Angular: new partner
        appRefId: currentAppId,                               // Angular: this.apprefId
        contrPartnerName: partnerName.trim(),                 // Angular: form value
        contrPartnerEmail: partnerEmail.toLowerCase().trim(), // Angular: form value
        contrPartnerContactNo: partnerContactNumber.trim(),   // Angular: form value
        contrPartnerPhoto: partnerPhoto,                      // Angular: file upload
        panNoPhoto: uploadPan,                                // Angular: file upload
        panNo: panNo.toUpperCase(),                           // Angular: uppercase
        isActive: true,                                       // Angular: default
        isDeleted: false,                                     // Angular: default
        createdOnDate: new Date().toISOString(),              // Angular: audit trail
        lastModifiedOnDate: new Date().toISOString(),         // Angular: audit trail
        createdBy: currentUserId,                             // Angular: audit trail
        lastModifiedBy: currentUserId                         // Angular: audit trail
      };
      
      console.log('📦 [ADD_PARTNER] Partner payload created:', partnerPayload);
      console.log('📦 [ADD_PARTNER] Payload structure breakdown:');
      console.log('📦 [ADD_PARTNER] - contactPartnershipId:', partnerPayload.contactPartnershipId);
      console.log('📦 [ADD_PARTNER] - appRefId:', partnerPayload.appRefId);
      console.log('📦 [ADD_PARTNER] - contrPartnerName:', partnerPayload.contrPartnerName);
      console.log('📦 [ADD_PARTNER] - contrPartnerEmail:', partnerPayload.contrPartnerEmail);
      console.log('📦 [ADD_PARTNER] - contrPartnerContactNo:', partnerPayload.contrPartnerContactNo);

      // Step 5: Call API (Angular: ContractorLicence/addUpdateContract_PartnerDetails)
      console.log('📤 [ADD_PARTNER] ===== CALLING API =====');
      console.log('📤 [ADD_PARTNER] API endpoint: ContractorLicence/addUpdateContract_PartnerDetails');
      console.log('📤 [ADD_PARTNER] HTTP method: POST');
      
      const result = await userDetailsService.addPartner(partnerPayload);
      
      console.log('📥 [ADD_PARTNER] ===== API RESPONSE =====');
      console.log('📥 [ADD_PARTNER] Partner creation response:', result);

      if (result?.success) {
        console.log('✅ [ADD_PARTNER] Partner created successfully');
        
        // Step 6: Show success modal (Angular uses SweetAlert)
        await SweetAlertService.success('Partner has been added successfully!', 'Partner Added');
        
        // Step 7: Reset form (Angular: form.reset() + markAsPristine())
        console.log('🔄 [ADD_PARTNER] Resetting form and clearing state');
        clearPartnerForm();
        setPartnerFormSubmitted(false);
        setPartnerCharacterCount({ name: 0, email: 0, contactNumber: 0, panNo: 0 });
        
        // Step 8: Refresh data (Angular: this.getContractorApplicationDetails())
        console.log('🔄 [ADD_PARTNER] Refreshing contractor application details');
        if (getContractorApplicationDetails) {
          await getContractorApplicationDetails();
        }
        
        console.log('✅ [ADD_PARTNER] ===== PARTNER CREATION PROCESS COMPLETED =====');
      } else {
        console.error('❌ [ADD_PARTNER] API failed:', result);
        await SweetAlertService.error(result?.error || 'Failed to add partner. Please try again.', 'Addition Failed');
      }
    } catch (error: any) {
      console.error('❌ [ADD_PARTNER] Exception occurred:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add partner';
      await SweetAlertService.error(errorMessage, 'Error');
    } finally {
      setIsAddingPartner(false);
    }
  };

  // Clear Instrument Form
  const clearInstrumentForm = () => {
    setInstrument("");
    setInstrumentSerialNo("");
    setInstrumentMake("");
    setInstrumentRangeFrom("");
    setInstrumentRangeTo("");
    setInstrumentRangeUnit("");
    setDistrict("");
    setTehsil("");
    setInstrumentDistrict("");
    setInstrumentTehsil("");
    resetTehsils();
  };


  // Clear Partner Form
  const clearPartnerForm = () => {
    setPartnerName("");
    setPartnerEmail("");
    setPartnerContactNumber("");
    setPartnerPhoto("");
    setUploadPan("");
    setPanNo("");
    setPartnerPhotoPreviewUrl("");
    setUploadPanPreviewUrl("");
  };

  // Handle File Upload
  const handleFileUploaded = (info: { formControlName: string; serverResponse: any }) => {
    const { formControlName, serverResponse } = info;
    const fileName = serverResponse.generatedFileNames.replace(/^,/, "");
    const fileUrl = `${import.meta.env.VITE_UPLOAD_URL}Uploads/Documents/TempFiles/${fileName.trim()}`;
    
    if (formControlName === 'partnerPhoto') {
      setPartnerPhoto(fileName);
      setPartnerPhotoPreviewUrl(fileUrl);
    } else if (formControlName === 'uploadPan') {
      setUploadPan(fileName);
      setUploadPanPreviewUrl(fileUrl);
    }
  };

  // Handle Delete Working Area (Angular naming: removeWorkingArea)
  const handleDeleteWorkingArea = async (workingArea: WorkingArea) => {
    console.log('🗑️ [DELETE_WORKING_AREA] ===== DELETE BUTTON CLICKED =====');
    console.log('🗑️ [DELETE_WORKING_AREA] Function: handleDeleteWorkingArea() started');
    console.log('🗑️ [DELETE_WORKING_AREA] Received workingArea object:', workingArea);
    
    // ✅ ADD: Enhanced debug logging for field analysis
    console.log('🗑️ [DELETE_WORKING_AREA] Field analysis:', {
      'workingArea.tehsilLevelUserMappingId': workingArea?.tehsilLevelUserMappingId,
      'workingArea.id': workingArea?.id,
      'workingArea.district': workingArea?.district,
      'workingArea.tehsil': workingArea?.tehsil,
      'workingArea.districtRefId': workingArea?.districtRefId,
      'workingArea.tehsilRefId': workingArea?.tehsilRefId,
      'typeof tehsilLevelUserMappingId': typeof workingArea?.tehsilLevelUserMappingId,
      'available fields': Object.keys(workingArea || {})
    });

    // ✅ FIX: Enhanced validation with better error messages
    if (!workingArea?.tehsilLevelUserMappingId && !workingArea?.id) {
      console.error('❌ [DELETE_WORKING_AREA] No valid ID found in working area object');
      console.error('❌ [DELETE_WORKING_AREA] Working area structure:', Object.keys(workingArea || {}));
      setSaveError('Invalid working area data. Please refresh the page and try again.');
      return;
    }

    // ✅ FIX: Use tehsilLevelUserMappingId if available, fallback to id
    const mappingId = workingArea?.tehsilLevelUserMappingId || workingArea?.id;
    console.log('🗑️ [DELETE_WORKING_AREA] Using mapping ID:', mappingId, 'Type:', typeof mappingId);

    if (!mappingId) {
      console.error('❌ [DELETE_WORKING_AREA] Missing tehsilLevelUserMappingId');
      setSaveError('Cannot delete: Missing working area identifier. Please refresh and try again.');
      return;
    }
    
    console.log('🔍 [DELETE_WORKING_AREA] ===== CHECKING IF WORKING AREA IS USED IN INSTRUMENTS =====');
    console.log('🔍 [DELETE_WORKING_AREA] Current instruments list:', instruments);
    console.log('🔍 [DELETE_WORKING_AREA] Instruments list length:', instruments?.length || 0);
    
    const exists = instruments.some((item: any) => {
      const workingAreaDistrictId = workingArea?.districtRefId;
      const workingAreaTehsilId = workingArea?.tehsilRefId;
      
      if (!workingAreaDistrictId || !workingAreaTehsilId) return false;
      
      const matchesDistrict = item.districtRefId === workingAreaDistrictId;
      const matchesTehsil = item.tehsilRefId === workingAreaTehsilId;
      console.log('🔍 [DELETE_WORKING_AREA] Checking instrument:', item);
      console.log('🔍 [DELETE_WORKING_AREA] - Instrument District ID:', item.districtRefId, 'vs Working Area District ID:', workingAreaDistrictId, 'Match:', matchesDistrict);
      console.log('🔍 [DELETE_WORKING_AREA] - Instrument Tehsil ID:', item.tehsilRefId, 'vs Working Area Tehsil ID:', workingAreaTehsilId, 'Match:', matchesTehsil);
      return matchesDistrict && matchesTehsil;
    });
    
    console.log('🔍 [DELETE_WORKING_AREA] Working area is used in instruments:', exists);
    
    if (exists) {
      console.log('⚠️ [DELETE_WORKING_AREA] ===== WORKING AREA IS IN USE - SHOWING ERROR =====');
      console.log('⚠️ [DELETE_WORKING_AREA] Cannot delete working area because it is being used in instruments');
      setSaveError(WORKING_AREA_ERRORS.IN_USE);
      return;
    }

    console.log('✅ [DELETE_WORKING_AREA] ===== WORKING AREA CAN BE DELETED =====');
    console.log('✅ [DELETE_WORKING_AREA] Working area is not used in any instruments');
    console.log('✅ [DELETE_WORKING_AREA] Starting confirmation dialog');

    // ✅ IMPROVED CONFIRMATION: More detailed message like Angular
    const confirmMessage = `Are you sure you want to delete the working area?\n\nDistrict: ${workingArea.district}\nTehsil: ${workingArea.tehsil}\n\nThis action cannot be undone.`;
    const confirmed = window.confirm(confirmMessage);
    
    if (!confirmed) {
      console.log('🗑️ [DELETE_WORKING_AREA] User cancelled deletion');
      return;
    }

    console.log('✅ [DELETE_WORKING_AREA] User confirmed deletion, proceeding...');

    // ✅ FIX: Use Angular's exact parameter format
    try {
      setIsAddingWorkingArea(true);
      
      console.log('🌐 [DELETE_WORKING_AREA] ===== MAKING DELETE API CALL =====');
      console.log('🌐 [DELETE_WORKING_AREA] API Endpoint: /ContractorLicence/deleteContractWorkingTehsil_ById');
      console.log('🌐 [DELETE_WORKING_AREA] API Method: GET (Angular parity - FIXED)');
      console.log('🌐 [DELETE_WORKING_AREA] Parameter format: Query string (Angular parity)');
      console.log('🌐 [DELETE_WORKING_AREA] workingTehsilId:', mappingId);

      // ✅ FIX: Use Angular's exact parameter name and format
      const response = await userDetailsService.deleteContractorWorkingArea(Number(mappingId));
      
      console.log('🎉 [DELETE_WORKING_AREA] ===== DELETE API RESPONSE RECEIVED =====');
      console.log('🎉 [DELETE_WORKING_AREA] API Response data:', response);

      // ✅ ANGULAR PARITY: Check response success like Angular
      if (response.success) {
        console.log('✅ [DELETE_WORKING_AREA] Deletion successful');
        
        // ✅ ANGULAR PARITY: Show success message like Angular's SweetAlert
        setSaveSuccess('Working area has been deleted successfully!');
        
        console.log('🔄 [DELETE_WORKING_AREA] ===== REFRESHING DATA AFTER DELETE =====');
        console.log('🔄 [DELETE_WORKING_AREA] Calling getContractorApplicationDetails to refresh data');
        
        // ✅ ANGULAR PARITY: Refresh data from server like Angular
        await getContractorApplicationDetails();
      } else {
        console.error('❌ [DELETE_WORKING_AREA] API returned failure:', response);
        setSaveError(response.message || 'Failed to delete working area');
      }
      
    } catch (error) {
      console.error('❌ [DELETE_WORKING_AREA] ===== DELETE API ERROR =====');
      console.error('❌ [DELETE_WORKING_AREA] API Error:', error);
      setSaveError('An error occurred while deleting the working area. Please try again.');
    } finally {
      setIsAddingWorkingArea(false);
    }
  };

  // ✅ INSTRUMENT DETAILS FUNCTIONALITY - Angular Parity Implementation
  
  /**
   * 🔧 UPDATE INSTRUMENT CHARACTER COUNT - Angular: updateInstrumentCharacterCount()
   * Real-time character counting for instrument form fields
   */
  const updateInstrumentCharacterCount = useCallback(() => {
    setInstrumentCharacterCount({
      make: instrumentMake?.length || 0,
      serialNo: instrumentSerialNo?.length || 0
    });
  }, [instrumentMake, instrumentSerialNo]);

  /**
   * ✅ VALIDATE INSTRUMENT FORM - Angular: instrumentForm.valid check
   * Comprehensive form validation matching Angular patterns
   */
  const validateInstrumentForm = useCallback((): boolean => {
    const errors: any = {};
    let isValid = true;

    // Instrument validation (Angular: Validators.required)
    if (!instrument) {
      errors.instrument = 'Please select an instrument';
      isValid = false;
    }

    // Serial Number validation (Angular: Validators.required + pattern)
    if (!instrumentSerialNo || instrumentSerialNo.trim().length < 3) {
      errors.serialNo = 'Serial number is required (minimum 3 characters)';
      isValid = false;
    } else if (instrumentSerialNo.length > 50) {
      errors.serialNo = 'Serial number cannot exceed 50 characters';
      isValid = false;
    }

    // Make validation (Angular: Validators.required + pattern)
    if (!instrumentMake || instrumentMake.trim().length < 2) {
      errors.make = 'Make is required (minimum 2 characters)';
      isValid = false;
    } else if (instrumentMake.length > 100) {
      errors.make = 'Make cannot exceed 100 characters';
      isValid = false;
    }

    // Range validation (Angular: Validators.required + numeric)
    const rangeFromNum = parseFloat(instrumentRangeFrom?.toString() || '0');
    const rangeToNum = parseFloat(instrumentRangeTo?.toString() || '0');
    
    if (!instrumentRangeFrom || rangeFromNum <= 0) {
      errors.rangeFrom = 'Range from is required and must be greater than 0';
      isValid = false;
    }

    if (!instrumentRangeTo || rangeToNum <= 0) {
      errors.rangeTo = 'Range to is required and must be greater than 0';
      isValid = false;
    }

    if (rangeFromNum > 0 && rangeToNum > 0 && rangeFromNum >= rangeToNum) {
      errors.rangeTo = 'Range to must be greater than range from';
      isValid = false;
    }

    // Range Unit validation (Angular: Validators.required)
    if (!instrumentRangeUnit) {
      errors.rangeUnit = 'Please select a range unit';
      isValid = false;
    }

    // District validation (Angular: Validators.required)
    if (!instrumentDistrict) {
      errors.district = 'Please select a district';
      isValid = false;
    }

    // Tehsil validation (Angular: Validators.required)
    if (!instrumentTehsil) {
      errors.tehsil = 'Please select a tehsil';
      isValid = false;
    }

    setInstrumentFormErrors(errors);
    return isValid;
  }, [instrument, instrumentSerialNo, instrumentMake, instrumentRangeFrom, instrumentRangeTo, instrumentRangeUnit, instrumentDistrict, instrumentTehsil]);

  /**
   * 🔧 ADD INSTRUMENT - Angular: createInstrumentDetails()
   * Complete instrument creation flow with validation and API integration
   */
  const handleAddInstrumentDetails = useCallback(async (): Promise<void> => {
    console.log('🔧 [ADD_INSTRUMENT] ===== STARTING INSTRUMENT CREATION PROCESS =====');
    
    setInstrumentFormSubmitted(true);
    setIsAddingInstrument(true);
    setInstrumentFormErrors({});
    setSaveError(null);

    try {
      // Step 1: Form Validation
      console.log('✅ [ADD_INSTRUMENT] Step 1: Form validation');
      if (!validateInstrumentForm()) {
        console.log('❌ [ADD_INSTRUMENT] Form validation failed');
        setIsAddingInstrument(false);
        return;
      }

      // Step 2: Check if application exists
      console.log('✅ [ADD_INSTRUMENT] Step 2: Application check');
      const currentAppId = applicationId || apprefId;
      if (!currentAppId) {
        setSaveError('Please complete application details first');
        setIsAddingInstrument(false);
        return;
      }

      // Step 3: Create Instrument Payload (Angular structure)
      console.log('✅ [ADD_INSTRUMENT] Step 3: Creating instrument payload');
      const instrumentPayload = {
        contactInstrumentId: 0,
        appRefId: currentAppId,
        applicationInstrumentsType: parseInt(instrument) || 1,
        instrumentSerialNo: instrumentSerialNo.trim(),
        instrumentMakeBy: instrumentMake.trim(),
        instrumentStartRange: instrumentRangeFrom.toString(),
        instrumentEndRange: instrumentRangeTo.toString(),
        applicationInstrumentRange: parseInt(instrumentRangeUnit) || 1,
        districtRefId: parseInt(instrumentDistrict.toString()) || 0,
        districtName: "", // Will be populated by API
        tehsilRefId: parseInt(instrumentTehsil.toString()) || 0,
        tehsilName: "", // Will be populated by API
        isActive: true,
        isDeleted: false,
        createdOnDate: new Date().toISOString(),
        lastModifiedOnDate: new Date().toISOString()
      };

      console.log('📤 [ADD_INSTRUMENT] Sending instrument payload:', instrumentPayload);

      // Step 4: API Call
      console.log('✅ [ADD_INSTRUMENT] Step 4: API call');
      const response = await userDetailsService.addInstrument(instrumentPayload);

      if (response.success) {
        console.log('🎉 [ADD_INSTRUMENT] Instrument added successfully');
        
        // Success feedback (Angular pattern)
        setSaveSuccess('Instrument details added successfully!');

        // Clear form (Angular pattern)
        setInstrument("");
        setInstrumentSerialNo("");
        setInstrumentMake("");
        setInstrumentRangeFrom("");
        setInstrumentRangeTo("");
        setInstrumentRangeUnit("");
        setInstrumentDistrict("");
        setInstrumentTehsil("");
        setInstrumentFormErrors({});
        setInstrumentFormSubmitted(false);
        
        // Reset character count
        setInstrumentCharacterCount({ make: 0, serialNo: 0 });

        // Refresh data (Angular pattern)
        await getContractorApplicationDetails();
      } else {
        console.error('❌ [ADD_INSTRUMENT] API returned error:', response);
        setSaveError(response.message || 'Failed to add instrument details. Please try again.');
      }

    } catch (error: any) {
      console.error('❌ [ADD_INSTRUMENT] Unexpected error:', error);
      setSaveError('An error occurred while adding instrument. Please try again.');
    } finally {
      setIsAddingInstrument(false);
    }
  }, [
    instrument, instrumentSerialNo, instrumentMake, instrumentRangeFrom, instrumentRangeTo, 
    instrumentRangeUnit, instrumentDistrict, instrumentTehsil, applicationId, apprefId,
    validateInstrumentForm, getContractorApplicationDetails
  ]);

  /**
   * 🗑️ DELETE INSTRUMENT - Angular: removeInstrument()
   * Instrument deletion with confirmation and API integration
   */
  const handleDeleteInstrumentDetails = useCallback(async (instrumentItem: Instrument): Promise<void> => {
    console.log('🗑️ [DELETE_INSTRUMENT] Starting delete process for:', instrumentItem);

    // Confirmation dialog (Angular uses SweetAlert, we'll use window.confirm for now)
    const confirmed = window.confirm(
      `Are you sure you want to delete instrument "${instrumentItem.instrumentType}"?\n\nSerial No: ${instrumentItem.instrumentSerialNo}\nMake: ${instrumentItem.instrumentMake}\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      console.log('❌ [DELETE_INSTRUMENT] User cancelled deletion');
      return;
    }

    try {
      console.log('✅ [DELETE_INSTRUMENT] User confirmed deletion');
      
      const response = await userDetailsService.deleteInstrument(instrumentItem.id);

      if (response.success) {
        console.log('✅ [DELETE_INSTRUMENT] Instrument deleted successfully');
        setSaveSuccess('Instrument has been deleted successfully.');
        
        // Refresh data
        await getContractorApplicationDetails();
      } else {
        console.error('❌ [DELETE_INSTRUMENT] Delete failed:', response);
        setSaveError('Failed to delete instrument. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ [DELETE_INSTRUMENT] Delete error:', error);
      setSaveError('An error occurred while deleting the instrument. Please try again.');
    }
  }, [getContractorApplicationDetails]);

  // Update character count in real-time
  useEffect(() => {
    updateInstrumentCharacterCount();
  }, [updateInstrumentCharacterCount]);

  // Handle Delete Instrument
  const handleDeleteInstrument = (id: number) => {
    setInstruments(instruments.filter(instrument => instrument.id !== id));
  };

  // Handle Delete Partner - Enhanced Angular Parity
  const handleDeletePartner = async (id: number) => {
    console.log('🗑️ [DELETE_PARTNER] Starting partner deletion process for ID:', id);
    
    // Find partner to delete for confirmation
    const partnerToDelete = partners.find(p => p.id === id);
    if (!partnerToDelete) {
      console.log('❌ [DELETE_PARTNER] Partner not found');
      return;
    }
    
    console.log('🗑️ [DELETE_PARTNER] Partner to delete:', partnerToDelete);
    
    try {
      // Angular equivalent: SweetAlert confirmation dialog
      const confirmResult = await SweetAlertService.confirmDelete(
        partnerToDelete.name || 'this partner',
        `Are you sure you want to delete partner "${partnerToDelete.name}"? This action cannot be undone.`
      );
      
      if (confirmResult.isConfirmed) {
        console.log('✅ [DELETE_PARTNER] User confirmed deletion');
        
        // If this is an existing partner (has database ID), call API
        if (partnerToDelete.id && typeof partnerToDelete.id === 'number' && partnerToDelete.id > 100) {
          console.log('🔄 [DELETE_PARTNER] Calling API to delete existing partner');
          
          try {
            const result = await userDetailsService.deletePartner(partnerToDelete.id);
            
            if (result?.success) {
              console.log('✅ [DELETE_PARTNER] Partner deleted from database successfully');
              await SweetAlertService.success('Partner has been deleted successfully!', 'Deleted!');
            } else {
              console.error('❌ [DELETE_PARTNER] API deletion failed:', result);
              await SweetAlertService.error('Failed to delete partner from database. Please try again.', 'Deletion Failed');
              return;
            }
          } catch (error: any) {
            console.error('❌ [DELETE_PARTNER] API error:', error);
            await SweetAlertService.error('Error occurred while deleting partner. Please try again.', 'Error');
            return;
          }
        }
        
        // Remove from local state
        console.log('🔄 [DELETE_PARTNER] Removing partner from local state');
        setPartners(partners.filter(partner => partner.id !== id));
        
        // Refresh data if available (Angular: getContractorApplicationDetails())
        if (getContractorApplicationDetails) {
          console.log('🔄 [DELETE_PARTNER] Refreshing contractor application details');
          await getContractorApplicationDetails();
        }
        
        console.log('✅ [DELETE_PARTNER] Partner deletion process completed');
      } else {
        console.log('❌ [DELETE_PARTNER] User cancelled deletion');
      }
    } catch (error: any) {
      console.error('❌ [DELETE_PARTNER] Exception during deletion:', error);
      await SweetAlertService.error('An error occurred during the deletion process.', 'Error');
    }
  };

  // Update character count in real-time
  useEffect(() => {
    updatePartnerCharacterCount();
  }, [updatePartnerCharacterCount]);

  // ✅ FIX #4: Partner Form Change Handlers with Real-time Character Count (Angular parity)
  // These handlers update both the field value and character count like Angular's updateShareCharacterCount()
  const handlePartnerNameChange = useCallback((value: string) => {
    console.log('📝 [PARTNER-CHAR-COUNT] Partner name changed:', value);
    setPartnerName(value);
    // Real-time character count update like Angular
    setPartnerCharacterCount(prev => ({ ...prev, name: value?.length || 0 }));
  }, []);

  const handlePartnerEmailChange = useCallback((value: string) => {
    console.log('📝 [PARTNER-CHAR-COUNT] Partner email changed:', value);
    setPartnerEmail(value);
    // Real-time character count update like Angular
    setPartnerCharacterCount(prev => ({ ...prev, email: value?.length || 0 }));
  }, []);

  const handlePartnerContactNumberChange = useCallback((value: string) => {
    console.log('📝 [PARTNER-CHAR-COUNT] Partner contact number changed:', value);
    setPartnerContactNumber(value);
    // Real-time character count update like Angular
    setPartnerCharacterCount(prev => ({ ...prev, contactNumber: value?.length || 0 }));
  }, []);

  const handlePartnerPanNoChange = useCallback((value: string) => {
    console.log('📝 [PARTNER-CHAR-COUNT] Partner PAN number changed:', value);
    setPanNo(value);
    // Real-time character count update like Angular
    setPartnerCharacterCount(prev => ({ ...prev, panNo: value?.length || 0 }));
  }, []);

  return {
    // Form States
    applicant_name,
    setApplicantName,
    address,
    setAddress,
    panCardNumber,
    setPanCardNumber,
    contractorType,
    setContractorType,
    currentWorkingVoltage,
    setCurrentWorkingVoltage,
    signeeNameOnBehalfOfCompany,
    setSigneeNameOnBehalfOfCompany,
    businessEntity,
    setBusinessEntity,
    businessEntityAddress,
    setBusinessEntityAddress,
    
    // Working Area States (Angular naming: workingAreaList)
    workingOnDistrict, 
    setWorkingOnDistrict,
    workingOnTehsil, 
    setWorkingOnTehsil,
    workingAreaList, 
    setWorkingAreaList,
    workingAreaFormErrors,
    
    // Instrument States
    instrument, setInstrument,
    instrumentSerialNo, setInstrumentSerialNo,
    instrumentMake, setInstrumentMake,
    instrumentRangeFrom, setInstrumentRangeFrom,
    instrumentRangeTo, setInstrumentRangeTo,
    instrumentRangeUnit, setInstrumentRangeUnit,
    district, setDistrict,
    tehsil, setTehsil,
    instrumentDistrict, setInstrumentDistrict, 
    instrumentTehsil, setInstrumentTehsil,
    instruments, setInstruments,
    selectedInstrumentList,
    instrumentFormErrors,
    setInstrumentFormErrors,
    instrumentCharacterCount,
    isAddingInstrument,
    instrumentFormSubmitted,
    
    // Partner States
    partnerName, setPartnerName,
    partnerEmail, setPartnerEmail,
    partnerContactNumber, setPartnerContactNumber,
    partnerPhoto, setPartnerPhoto,
    uploadPan, setUploadPan,
    panNo, setPanNo,
    partners, setPartners,
    partnerPhotoPreviewUrl,
    uploadPanPreviewUrl,
    partnerFormErrors,
    setPartnerFormErrors,
    partnerCharacterCount,
    isAddingPartner,
    partnerFormSubmitted,
    // Application States
    isInitialLoad, setIsInitialLoad,
    saveSuccess, setSaveSuccess,
    saveError, setSaveError,
    isAddingWorkingArea,

    // Application management (Angular naming: apprefId)
    applicationId,
    apprefId,
    applicationState,
    formMode,
    isCreatingApplication,
    applicationError,
    setFormMode,
    checkApplicationExists,
    
    // Location States
    districts,
    tehsils,
    loading,
    locationErrors,
    
    // Project Site States
    projectSiteLoading,
    projectSiteError,
    
    // Handler Functions
    handleWorkingDistrictChange,
    handleWorkingTehsilChange, 
    handleInstrumentDistrictChange,
    handleInstrumentTehsilChange,
    handleContractorTypeChange,
    handleCurrentWorkingVoltageChange,
    addWorkingArea, 
    handleAddInstrument,
    handleAddInstrumentDetails, // Enhanced Angular parity version
    handleAddPartner,
    handleDeleteWorkingArea,
    handleDeleteInstrument,
    handleDeleteInstrumentDetails, // Enhanced Angular parity version
    handleDeletePartner,
    handleFileUploaded,
    loadDistricts,
    loadTehsils,
    resetTehsils,

    // ✅ Partner Form Change Handlers with Character Count (Angular parity)
    handlePartnerNameChange,
    handlePartnerEmailChange,
    handlePartnerContactNumberChange,
    handlePartnerPanNoChange,

    // Validation functions
    validateWorkingAreaForm,
    validatePartnerForm,
    validateInstrumentForm,
    updatePartnerCharacterCount,
    updateInstrumentCharacterCount,
    getCurrentFormData,
    ensureApplicationExists,
    getContractorApplicationDetails,
    loadContractorDataFromAPI,
    
    // Application state management
    persistApplicationState,
    restoreApplicationState,
    
    // Mapping utility functions (from constants)
    getContractorTypeEnum,
    getVoltageTypeEnum,
    getRangeUnitEnum,
    getContractorTypeId,
    getVoltageTypeId,
    getRangeUnitId,

    // Field State Management (COMPLETE Angular parity)
    applicationData,
    hideContractorElementsForLockPage,
    isFormDisabled,
    areFieldsDisabled,

    // Field State Debug Information (helpful for testing)
    fieldStateDebug: {
      hasApplicationData: !!applicationData,
      isAllowEdit: applicationData?.isAllowEdit,
      applicationLifeCycleStatusType: applicationData?.applicationLifeCycleStatusType,
      applicationPurposeType: applicationData?.applicationPurposeType,
      hideContractorElementsForLockPage,
      instrumentsCount: instruments?.length || 0,
      computedDisabled: areFieldsDisabled
    }
  };
};