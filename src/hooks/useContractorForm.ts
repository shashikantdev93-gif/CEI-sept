import { useState, useEffect, useCallback } from 'react';
import { useLocation } from './useLocation';
import { userDetailsService } from '../services/api/userDetailsService';
import type { WorkingArea, Instrument, Partner } from '../types/contractor.types';
import { ProjectSiteDataMapper } from '../utils/projectSiteDataMapper';
import { INSTRUMENT_LISTS, WORKING_AREA_ERRORS, WORKING_AREA_SUCCESS_MESSAGES } from '../constants/contractor'; // Add missing imports
import { useContractorApplication } from './useContractorApplication';
import { validateWorkingAreaDuplicate, createWorkingAreaPayload } from '../utils/contractorUtils'; // Add missing imports
import { ToastService } from '../utils/navigation'; // Add missing import


export const useContractorForm = () => {
  // Basic Form State
  const [applicant_name, setApplicantName] = useState(""); 
  const [address, setAddress] = useState("");
  const [panCardNumber, setPanCardNumber] = useState(""); 
  const [contractorType, setContractorType] = useState("");
  const [currentWorkingVoltage, setCurrentWorkingVoltage] = useState("");
  const [signeeNameOnBehalfOfCompany, setSigneeNameOnBehalfOfCompany] = useState("");
  const [businessEntity, setBusinessEntity] = useState("");
  const [businessEntityAddress, setBusinessEntityAddress] = useState("");

  // Working Area State
  const [workingOnDistrict, setWorkingOnDistrict] = useState<number | "">("");
  const [workingOnTehsil, setWorkingOnTehsil] = useState<number | "">("");
  const [workingAreas, setWorkingAreas] = useState<WorkingArea[]>([]);

  // Instrument State
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

  // Partner State
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerContactNumber, setPartnerContactNumber] = useState("");
  const [partnerPhoto, setPartnerPhoto] = useState("");
  const [uploadPan, setUploadPan] = useState("");
  const [panNo, setPanNo] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerPhotoPreviewUrl, setPartnerPhotoPreviewUrl] = useState("");
  const [uploadPanPreviewUrl, setUploadPanPreviewUrl] = useState("");

  // Application State
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isAddingWorkingArea, setIsAddingWorkingArea] = useState(false);
  const { districts, tehsils, loading, errors: locationErrors, loadDistricts, loadTehsils, resetTehsils } = useLocation();
  const [workingAreaFormErrors, setWorkingAreaFormErrors] = useState<{
    district?: string;
    tehsil?: string;
  }>({});

  const {
    applicationId,
    isCreatingApplication,
    applicationError,
    createApplication,
    checkApplicationExists
  } = useContractorApplication();

  // Helper function to get current form data
  const getCurrentFormData = useCallback(() => ({
    applicant_name,
    address,
    panCardNumber,
    contractorType,
    currentWorkingVoltage,
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
    const loadInitialData = async () => {
      try {
        const response = await userDetailsService.getProjectSiteData();
        if (response.data?.users?.userProfileMapping?.userProfile) {
          const userProfile = response.data.users.userProfileMapping.userProfile;
          
          setApplicantName(ProjectSiteDataMapper.getApplicantName(userProfile));
          setAddress(ProjectSiteDataMapper.getCommunicationAddress(userProfile));
          setPanCardNumber(response.data.applicantPanNumber || "");
        }
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setIsInitialLoad(false);
      }
    };

    loadInitialData();
    loadDistricts(3); // Load districts for Punjab (ID: 3)
  }, [loadDistricts]);

  // Ensure application exists before operations
  const ensureApplicationExists = useCallback(async (): Promise<number | null> => {
  console.log('🔍 [CONTRACTOR-FORM] Checking if application exists...');
  
  if (checkApplicationExists()) {
    console.log('✅ [CONTRACTOR-FORM] Application exists:', applicationId);
    return applicationId;
  }

  console.log('📝 [CONTRACTOR-FORM] Application does not exist, creating...');
  const formData = getCurrentFormData();
  return await createApplication(formData);
}, [applicationId, checkApplicationExists, createApplication, getCurrentFormData]);

// FIXED: Add missing dependency array to refreshContractorData
const refreshContractorData = useCallback(async () => {
  if (!applicationId) return;
  
  try {
    console.log('🔄 [CONTRACTOR-FORM] Refreshing contractor data...');
    const response = await userDetailsService.getContractorApplicationDetailsById(applicationId);
    
    if (response.success && response.data) {
      // Update working areas from fresh data
      const freshWorkingAreas = response.data.workingAreas?.map((area: any, index: number) => ({
        id: area.id || Date.now() + index,
        district: area.districtName,
        tehsil: area.tehsilName,
        action: 'Delete',
        districtRefId: area.districtCode,
        tehsilRefId: area.tehsilId,
        appRefId: area.appRefId
      })) || [];
      
      setWorkingAreas(freshWorkingAreas);
      console.log('✅ [CONTRACTOR-FORM] Data refreshed successfully');
    }
  } catch (error) {
    console.error('❌ [CONTRACTOR-FORM] Error refreshing data:', error);
  }
}, [applicationId]);

  // Enhanced Add Working Area with validation and application check
const handleAddWorkingArea = useCallback(async () => {
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
    console.log('🚀 [ADD-WORKING-AREA] Current applicationId:', applicationId);
    
    let currentApplicationId = applicationId;
    
    if (!currentApplicationId || currentApplicationId === 0) {
      console.log('📝 [ADD-WORKING-AREA] applicationId is 0/undefined, calling ensureApplicationExists');
      try {
        currentApplicationId = await ensureApplicationExists();
        if (!currentApplicationId) {
          console.error('❌ [ADD-WORKING-AREA] Error in ensureApplicationExists');
          setSaveError(WORKING_AREA_ERRORS.APPLICATION_CREATE_FAILED);
          return;
        }
        console.log('✅ [ADD-WORKING-AREA] ensureApplicationExists completed successfully');
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
    
    const existingWorkingAreas = workingAreas || [];
    
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
      currentApplicationId,
      districtRefId,
      tehsilRefId,
      selectedDistrict?.districtName || '',
      selectedTehsil?.tehsilName || ''
    );

    console.log('📦 [ADD-WORKING-AREA] Final payload:', workingAreaPayload);

    // STEP 6: Make API call (matches Angular API call structure)
    console.log('🌐 [ADD-WORKING-AREA] Making API call to backend...');
    
    // Show spinner (matches Angular this.spinner.show())
    setIsAddingWorkingArea(true);
    
    const response = await userDetailsService.addWorkingArea(workingAreaPayload);

    if (response.success) {
      // STEP 7: Handle success response (matches Angular success handler)
      console.log('✅ [ADD-WORKING-AREA] API call successful');
      
      // Hide spinner (matches Angular this.spinner.hide())
      setIsAddingWorkingArea(false);
      
      // Clear form (matches Angular form clearing)
      setWorkingOnDistrict("");
      setWorkingOnTehsil("");
      setWorkingAreaFormErrors({});
      resetTehsils();

      // Add to local state (matches Angular data refresh)
      const newWorkingArea: WorkingArea = {
        id: Date.now(),
        district: selectedDistrict?.districtName || districtRefId.toString(),
        tehsil: selectedTehsil?.tehsilName || tehsilRefId.toString(),
        action: 'Delete'
      };

      setWorkingAreas([...workingAreas, newWorkingArea]);
      setSaveSuccess(WORKING_AREA_SUCCESS_MESSAGES.AREA_ADDED);
      ToastService.success(WORKING_AREA_SUCCESS_MESSAGES.AREA_ADDED);
      
      console.log('✅ [ADD-WORKING-AREA] Working area added successfully to local state');

      // Optional: Refresh contractor application details (matches Angular this.getContractorApplicationDetails())
      await refreshContractorData();

    } else {
      throw new Error(response.error || 'Failed to add working area');
    }

  } catch (error: any) {
    // STEP 8: Handle error response (matches Angular error handling)
    console.error('❌ [ADD-WORKING-AREA] API Error:', error);
    
    // Hide spinner on error (matches Angular this.spinner.hide())
    setIsAddingWorkingArea(false);
    
    const errorMessage = error?.message || WORKING_AREA_ERRORS.ADD_FAILED;
    setSaveError(errorMessage);
    ToastService.error(errorMessage);
  }
}, [
  // FIXED: Add all dependencies used in the callback
  workingOnDistrict,
  workingOnTehsil,
  applicationId,
  ensureApplicationExists,
  workingAreas,
  districts,
  tehsils,
  resetTehsils,
  refreshContractorData
]);

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


  // Handle Contractor Type Change
  const handleContractorTypeChange = (value: string) => {
    setContractorType(value);
  };

  // Handle Working Voltage Change
  const handleCurrentWorkingVoltageChange = (value: string) => {
    setCurrentWorkingVoltage(value);
    
    let newInstrumentList: Array<{value: number, name: string}> = [];
    
    switch (value) {
      case "Low/Medium Voltage":
        newInstrumentList = INSTRUMENT_LISTS.lowMediumVoltage;
        break;
      case "High Voltage":
        newInstrumentList = INSTRUMENT_LISTS.highVoltage;
        break;
      case "Extra High Voltage":
        newInstrumentList = INSTRUMENT_LISTS.extraHighVoltage;
        break;
    }
    
    setSelectedInstrumentList(newInstrumentList);
    if (instrument) setInstrument("");
  };

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
      
      const instrumentPayload = {
        contactInstrumentId: 0,
        appRefId: applicationId,
        applicationInstrumentsType: selectedInstrumentValue || 1,
        instrumentSerialNo: instrumentSerialNo.toUpperCase(),
        instrumentMakeBy: instrumentMake,
        instrumentStartRange: instrumentRangeFrom,
        instrumentEndRange: instrumentRangeTo,
        applicationInstrumentRange: 1,
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


  // Handle Add Partner
  const handleAddPartner = async () => {
    if (!partnerName || !partnerEmail || !partnerContactNumber || !panNo || !partnerPhoto || !uploadPan || !applicationId) {
      setSaveError('Please fill all required fields');
      return;
    }

    try {
      const panValidationResponse = await userDetailsService.validatePANNumber(panNo);
      
      if (panValidationResponse.data?.formModel !== null) {
        setSaveError('PAN Number already exists');
        return;
      }

      const partnerPayload = {
        contactPartnershipId: 0,
        appRefId: applicationId,
        contrPartnerName: partnerName,
        contrPartnerEmail: partnerEmail,
        contrPartnerContactNo: partnerContactNumber,
        contrPartnerPhoto: partnerPhoto,
        panNoPhoto: uploadPan,
        panNo: panNo,
        isActive: true,
        isDeleted: false,
        createdOnDate: new Date().toISOString(),
        lastModifiedOnDate: new Date().toISOString()
      };

      const result = await userDetailsService.addPartner(partnerPayload);

      if (result?.success) {
        const newPartner: Partner = {
          id: Date.now(),
          name: partnerName,
          email: partnerEmail,
          mobileNumber: partnerContactNumber,
          photo: partnerPhoto,
          pan: uploadPan,
          panNo: panNo,
          action: 'Delete'
        };
        
        setPartners([...partners, newPartner]);
        clearPartnerForm();
        setSaveSuccess('Partner added successfully!');
      }
    } catch (error: any) {
      setSaveError(error?.message || 'Failed to add partner');
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

  // Handle Delete Working Area
  const handleDeleteWorkingArea = (id: number) => {
    setWorkingAreas(workingAreas.filter(area => area.id !== id));
  };

  // Handle Delete Instrument
  const handleDeleteInstrument = (id: number) => {
    setInstruments(instruments.filter(instrument => instrument.id !== id));
  };

  // Handle Delete Partner
  const handleDeletePartner = (id: number) => {
    setPartners(partners.filter(partner => partner.id !== id));
  };

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
    
    // Working Area States
    workingOnDistrict, 
    setWorkingOnDistrict,
    workingOnTehsil, 
    setWorkingOnTehsil,
    workingAreas, 
    setWorkingAreas,
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
    // Application States
    isInitialLoad, setIsInitialLoad,
    saveSuccess, setSaveSuccess,
    saveError, setSaveError,
    isAddingWorkingArea,
  

    // Application management
    applicationId,
    isCreatingApplication,
    applicationError,
    checkApplicationExists,
    
    // Location States
    districts,
    tehsils,
    loading,
    locationErrors,
    
    // Handler Functions
    handleWorkingDistrictChange,
    handleWorkingTehsilChange, 
    handleInstrumentDistrictChange,
    handleInstrumentTehsilChange,
    handleContractorTypeChange,
    handleCurrentWorkingVoltageChange,
    handleAddWorkingArea, 
    handleAddInstrument,
    handleAddPartner,
    handleDeleteWorkingArea,
    handleDeleteInstrument,
    handleDeletePartner,
    handleFileUploaded,
    loadDistricts,
    loadTehsils,
    resetTehsils,

    // Validation functions
    validateWorkingAreaForm,
    getCurrentFormData,
    ensureApplicationExists
  };
};