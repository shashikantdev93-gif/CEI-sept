import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/shared-component/DataTable';
import { useLocation } from '../../hooks/useLocation';
import { useProjectSiteAPI } from '../../hooks/useProjectSiteAPI';
import { ProjectSiteDataMapper } from '../../utils/projectSiteDataMapper';
import FileUpload from '../../components/FileUpload';
import { userDetailsService } from '../../services/api/userDetailsService';
import type { ContractorApplicationPayload, PartnerPayload, InstrumentPayload } from '../../services/api/userDetailsService';

// Add instrument lists based on voltage types (matching Angular logic)
const instrumentLists = {
  lowMediumVoltage: [
    { value: 1, name: "Earth resistance tester" },
    { value: 2, name: "Tong tester" },
    { value: 3, name: "Multimeter" },
    { value: 4, name: "Insulation tester of 500 volts" }
  ],
  highVoltage: [
    { value: 5, name: "Earth resistance tester" },
    { value: 6, name: "Tong tester" },
    { value: 7, name: "Multimeter" },
    { value: 8, name: "Insulation tester of 500 volts" },
    { value: 9, name: "Insulation tester of 2500 volts (Only for High Voltage contractors)" }
  ],
  extraHighVoltage: [
    { value: 10, name: "Earth resistance tester" },
    { value: 11, name: "Tong tester" },
    { value: 12, name: "Multimeter" },
    { value: 13, name: "Insulation tester of 500 volts" },
    { value: 14, name: "Insulation tester of 2500 volts (Only for High Voltage contractors)" },
    { value: 15, name: "Insulation tester of 5000 volts (Only for Extra High Voltage contractors)" },
    { value: 16, name: "Machine for testing of B.D.voltage value of Transformer oil" }
  ]
};

interface WorkingArea {
  id: number;
  district: string;
  tehsil: string;
  action: string;
}

interface Instrument {
  id: number;
  instrumentType: string;
  instrumentSerialNo: string;
  instrumentMake: string;
  instrumentRange: string;
  district: string;
  tehsil: string;
  action: string;
}

interface Partner {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  photo: string;
  pan: string;
  panNo: string;
  action: string;
}

const ContractorApplicantDetails: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ContractorApplicantDetails - Cleaning up navigation flags');
    sessionStorage.removeItem('allowContractorDetailsNavigation');
    
    return () => {
      sessionStorage.removeItem('allowContractorDetailsNavigation');
    };
  }, []);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [contractorType, setContractorType] = useState("");
  const [currentWorkingVoltage, setCurrentWorkingVoltage] = useState("");
  const [signeeNameOnBehalfOfCompany, setSigneeNameOnBehalfOfCompany] = useState("");
  
  // Working area state - updated to use numbers for district/tehsil like in user details
  const [workingOnDistrict, setWorkingOnDistrict] = useState<number | "">("");
  const [workingOnTehsil, setWorkingOnTehsil] = useState<number | "">("");

  // Instrument state 
  const [instrument, setInstrument] = useState("");
  const [instrumentSerialNo, setInstrumentSerialNo] = useState("");
  const [instrumentMake, setInstrumentMake] = useState("");
  const [instrumentRangeFrom, setInstrumentRangeFrom] = useState("");
  const [instrumentRangeTo, setInstrumentRangeTo] = useState("");
  const [instrumentRangeUnit, setInstrumentRangeUnit] = useState("");
  const [district, setDistrict] = useState<number | "">("");
  const [tehsil, setTehsil] = useState<number | "">("");

  const [workingAreas, setWorkingAreas] = useState<WorkingArea[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Add application ID state for working area API calls (matching Angular apprefId: 3596)
  const [applicationId, setApplicationId] = useState<number>(3596);

  // Add new state for selected instrument list
  const [selectedInstrumentList, setSelectedInstrumentList] = useState<Array<{value: number, name: string}>>([]);

  // Add new state for Business Entity fields
  const [businessEntity, setBusinessEntity] = useState("");
  const [businessEntityAddress, setBusinessEntityAddress] = useState("");
  
  // Add new state for Partner/Shareholder Details
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerContactNumber, setPartnerContactNumber] = useState("");
  const [partnerPhoto, setPartnerPhoto] = useState("");
  const [uploadPan, setUploadPan] = useState("");
  const [panNo, setPanNo] = useState("");
  const [partnerPhotoPreviewUrl, setPartnerPhotoPreviewUrl] = useState("");
  const [uploadPanPreviewUrl, setUploadPanPreviewUrl] = useState("");
  
  const [partners, setPartners] = useState<Partner[]>([]);

  // Add new state for API notifications
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Location hook for dynamic dropdowns (same as user details)
  const {
    districts,
    tehsils,
    loading,
    errors: locationErrors,
    loadDistricts,
    loadTehsils,
    resetTehsils
  } = useLocation();

  // Enhanced Project Site API hook with contractor support
  const {
    loading: apiLoading,
    error: apiError,
    refreshData,
    contractorSaving,
    contractorError,
    saveContractorApplication,
    clearContractorError
  } = useProjectSiteAPI({
    pageType: 'contractorApplication',
    autoLoad: true,
    enableCounts: false,
    onDataLoaded: (data) => {
      console.log('🎯 [CONTRACTOR-FORM]: Project site data loaded:', data);
      
      // Auto-fill the form fields using the mapper
      const userProfile = data.users?.userProfileMapping?.userProfile;
      
      if (userProfile) {
        // Get applicant name using the same logic as dashboard
        const applicantName = ProjectSiteDataMapper.getApplicantName(userProfile);
        setName(applicantName);
        
        // Get communication address using the same logic as dashboard
        const communicationAddress = ProjectSiteDataMapper.getCommunicationAddress(userProfile);
        setAddress(communicationAddress);
        
        console.log('✅ [CONTRACTOR-FORM]: Auto-filled Name:', applicantName);
        console.log('✅ [CONTRACTOR-FORM]: Auto-filled Address:', communicationAddress);
      }
      
      // Auto-fill PAN number if available in the project site data
      if (data.applicantPanNumber) {
        setPanNumber(data.applicantPanNumber);
        console.log('✅ [CONTRACTOR-FORM]: Auto-filled PAN Number:', data.applicantPanNumber);
      }
      
      setIsInitialLoad(false);
    },
    onError: (error) => {
      console.error('🎯 [CONTRACTOR-FORM]: Error loading project site data:', error);
      setIsInitialLoad(false);
    },
    onContractorSaveSuccess: (data) => {
      console.log('✅ [CONTRACTOR-FORM] Save success callback:', data);
      setSaveSuccess('Working area saved successfully!');
      setSaveError(null);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    },
    onContractorSaveError: (error) => {
      console.error('❌ [CONTRACTOR-FORM] Save error callback:', error);
      setSaveError(error);
      setSaveSuccess(null);
    }
  });

  // Load districts for Punjab automatically on mount
  useEffect(() => {
    console.log('🏘️ [CONTRACTOR-FORM] Component mounted, loading districts for Punjab (ID: 3)');
    loadDistricts(3);
  }, [loadDistricts]);

  // Clear notifications when form changes
  useEffect(() => {
    if (saveSuccess || saveError) {
      const timer = setTimeout(() => {
        setSaveSuccess(null);
        setSaveError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess, saveError]);

  // Initialize instrument list based on current working voltage
  useEffect(() => {
    console.log('🔧 [INSTRUMENT_INIT] ===== INITIALIZING INSTRUMENT LIST =====');
    console.log('🔧 [INSTRUMENT_INIT] Current working voltage on mount:', currentWorkingVoltage);
    
    if (currentWorkingVoltage) {
      handleCurrentWorkingVoltageChange(currentWorkingVoltage);
    } else {
      console.log('🔧 [INSTRUMENT_INIT] No voltage selected, instrument list will remain empty');
      setSelectedInstrumentList([]);
    }
  }, []); // Run only on mount

  // Handle contractor type change
  const handleContractorTypeChange = (value: string) => {
    console.log('📋 [CONTRACTOR_TYPE] ===== CONTRACTOR TYPE CHANGED =====');
    console.log('📋 [CONTRACTOR_TYPE] Previous contractorType:', contractorType);
    console.log('📋 [CONTRACTOR_TYPE] New contractorType:', value);
    
    setContractorType(value);
    
    const isIndividual = value === "Individual";
    console.log('� [CONTRACTOR_TYPE] Is Individual contractor:', isIndividual);
    
    console.log('📋 [CONTRACTOR_TYPE] Determining Partner/Shareholder form visibility...');
    console.log('📋 [CONTRACTOR_TYPE] Contractor types that require Partner form: [Private Limited, Public Limited, Partnership, Proprietorship]');
    console.log('📋 [CONTRACTOR_TYPE] Current contractor type:', value);
    
    const showPartnerSection = ['Private Limited', 'Public Limited', 'Partnership', 'Proprietorship'].includes(value);
    console.log('📋 [CONTRACTOR_TYPE] Is contractor type in required list:', showPartnerSection);
    
    console.log('📋 [CONTRACTOR_TYPE] ===== FINAL RESULT =====');
    console.log('📋 [CONTRACTOR_TYPE] showPartnerSection (Partner section visible):', showPartnerSection);
    console.log('📋 [CONTRACTOR_TYPE] Individual contractor (no partners needed):', isIndividual);
    
    if (showPartnerSection) {
      console.log('✅ [CONTRACTOR_TYPE] Partner/Shareholder Details section will be shown');
      console.log('✅ [CONTRACTOR_TYPE] User can now add partners/shareholders');
    } else {
      console.log('❌ [CONTRACTOR_TYPE] Partner/Shareholder Details section will be hidden');
      console.log('❌ [CONTRACTOR_TYPE] Individual contractor - no partners needed');
    }
  };

  // Handle current working voltage change
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
    
    switch (value) {
      case "Low/Medium Voltage":
        newInstrumentList = instrumentLists.lowMediumVoltage;
        console.log('⚡ [WORKING_VOLTAGE] Selected: Low/Medium Voltage');
        console.log('⚡ [WORKING_VOLTAGE] Available instruments:', newInstrumentList);
        break;
      case "High Voltage":
        newInstrumentList = instrumentLists.highVoltage;
        console.log('⚡ [WORKING_VOLTAGE] Selected: High Voltage');
        console.log('⚡ [WORKING_VOLTAGE] Available instruments:', newInstrumentList);
        break;
      case "Extra High Voltage":
        newInstrumentList = instrumentLists.extraHighVoltage;
        console.log('⚡ [WORKING_VOLTAGE] Selected: Extra High Voltage');
        console.log('⚡ [WORKING_VOLTAGE] Available instruments:', newInstrumentList);
        break;
      default:
        newInstrumentList = [];
        console.log('⚡ [WORKING_VOLTAGE] No voltage selected or invalid selection');
        console.log('⚡ [WORKING_VOLTAGE] Instrument list cleared');
        break;
    }
    
    setSelectedInstrumentList(newInstrumentList);
    
    // Clear instrument selection when voltage changes
    if (instrument && value !== currentWorkingVoltage) {
      console.log('⚡ [WORKING_VOLTAGE] Clearing previous instrument selection due to voltage change');
      setInstrument("");
    }
    
    console.log('⚡ [WORKING_VOLTAGE] ===== FINAL RESULT =====');
    console.log('⚡ [WORKING_VOLTAGE] New instrument list length:', newInstrumentList.length);
    console.log('⚡ [WORKING_VOLTAGE] Instrument dropdown enabled:', newInstrumentList.length > 0);
    console.log('⚡ [WORKING_VOLTAGE] Previous instrument selection cleared:', !!instrument && value !== currentWorkingVoltage);
  };

  // Handle working area district change
  const handleWorkingDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = Number(e.target.value);
    console.log('🏘️ [WORKING-AREA] District changed:', districtCode);
    
    setWorkingOnDistrict(districtCode);
    setWorkingOnTehsil("");
    resetTehsils();

    if (districtCode) {
      console.log('🏘️ [WORKING-AREA] Loading tehsils for district:', districtCode);
      loadTehsils(districtCode);
    } else {
      console.log('🏘️ [WORKING-AREA] District cleared or invalid, not loading tehsils');
    }
  };

  // Handle instrument district change
  const handleInstrumentDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = Number(e.target.value);
    console.log('🏘️ [INSTRUMENT] District changed:', districtCode);
    
    setDistrict(districtCode);
    setTehsil("");
    resetTehsils();

    if (districtCode) {
      console.log('🏘️ [INSTRUMENT] Loading tehsils for district:', districtCode);
      loadTehsils(districtCode);
    } else {
      console.log('🏘️ [INSTRUMENT] District cleared or invalid, not loading tehsils');
    }
  };

  // Enhanced handleAddWorkingArea with API integration (matching Angular implementation exactly)
  const handleAddWorkingArea = async () => {
    if (workingOnDistrict && workingOnTehsil) {
      console.log('🔄 [CONTRACTOR-FORM] Adding working area using Angular-compatible API...');
      
      // Find district and tehsil names for display
      const selectedDistrict = districts.find(d => d.districtCode === workingOnDistrict);
      const selectedTehsil = tehsils.find(t => t.tehsilId === workingOnTehsil);
      
      // Create payload matching Angular structure exactly
      const workingAreaPayload = {
        tehsilLevelUserMappingId: 0,
        appRefId: applicationId, // Using the same app ID as Angular (3596)
        districtRefId: workingOnDistrict,
        tehsilRefId: workingOnTehsil,
        createdOnDate: new Date().toISOString(),
        lastModifiedOnDate: new Date().toISOString(),
        districtName: selectedDistrict?.districtName || workingOnDistrict.toString(),
        tehsilName: selectedTehsil?.tehsilName || workingOnTehsil.toString()
      };

      console.log('📤 [CONTRACTOR-FORM] Sending working area payload to Angular-compatible API:', workingAreaPayload);

      try {
        // Call the new working area API that matches Angular exactly
        const result = await userDetailsService.addWorkingArea(workingAreaPayload);

        if (result?.success || result?.data) {
          console.log('✅ [CONTRACTOR-FORM] Working area saved successfully via Angular-compatible API');
          
          // Create new working area for UI update
          const newArea: WorkingArea = {
            id: Date.now(),
            district: selectedDistrict?.districtName || workingOnDistrict.toString(),
            tehsil: selectedTehsil?.tehsilName || workingOnTehsil.toString(),
            action: 'Delete'
          };

          // Add to local state for immediate UI update
          setWorkingAreas([...workingAreas, newArea]);
          
          // Clear form fields only on success
          setWorkingOnDistrict("");
          setWorkingOnTehsil("");
          resetTehsils();
          
          // Refresh data like Angular does - call getContractorApplicationDetailsById
          console.log('🔄 [CONTRACTOR-FORM] Refreshing contractor application details...');
          try {
            const refreshResult = await userDetailsService.getContractorApplicationDetailsById(applicationId);
            console.log('✅ [CONTRACTOR-FORM] Contractor application details refreshed successfully:', refreshResult);
          } catch (refreshError) {
            console.error('❌ [CONTRACTOR-FORM] Error refreshing contractor application details:', refreshError);
          }
          
        } else {
          console.error('❌ [CONTRACTOR-FORM] Failed to save working area - API returned false');
        }
      } catch (error: any) {
        console.error('❌ [CONTRACTOR-FORM] API call failed:', error);
        console.error('❌ [CONTRACTOR-FORM] Error details:', {
          message: error?.message,
          status: error?.status,
          response: error?.response?.data
        });
      }
    }
  };

  const handleAddInstrument = async () => {
    console.log('🔧 [ADD_INSTRUMENT] ===== ADD INSTRUMENT FUNCTION STARTED =====');
    console.log('🔧 [ADD_INSTRUMENT] Function: handleAddInstrument()');
    console.log('🔧 [ADD_INSTRUMENT] Current applicationId:', applicationId);
    console.log('🔧 [ADD_INSTRUMENT] Current instruments length:', instruments?.length || 0);
    console.log('🔧 [ADD_INSTRUMENT] Current workingAreas length:', workingAreas?.length || 0);
    
    // Validate required fields
    if (!instrument || !instrumentSerialNo || !instrumentMake || !district || !tehsil) {
      console.log('❌ [ADD_INSTRUMENT] Form validation failed - missing required fields');
      console.log('❌ [ADD_INSTRUMENT] Missing fields:', {
        instrument: !instrument,
        instrumentSerialNo: !instrumentSerialNo,
        instrumentMake: !instrumentMake,
        district: !district,
        tehsil: !tehsil
      });
      setSaveError('Please fill all required fields');
      return;
    }

    console.log('✅ [ADD_INSTRUMENT] Form validation passed');
    console.log('🔧 [ADD_INSTRUMENT] Form values:', {
      instrument,
      instrumentSerialNo,
      instrumentMake,
      instrumentRangeFrom,
      instrumentRangeTo,
      instrumentRangeUnit,
      district,
      tehsil
    });

    try {
      // Step 1: Check for duplicate instrument serial number
      console.log('🔧 [ADD_INSTRUMENT] ===== CHECKING DUPLICATE INSTRUMENT SERIAL NUMBER =====');
      const serialNumberToCheck = instrumentSerialNo.toUpperCase();
      console.log('🔧 [ADD_INSTRUMENT] Serial number to check:', serialNumberToCheck);
      
      const duplicateCheckResponse = await userDetailsService.validateInstrumentSerialNumber(serialNumberToCheck);
      
      if (duplicateCheckResponse.data?.formModel && duplicateCheckResponse.data.formModel.length > 0) {
        console.log('❌ [ADD_INSTRUMENT] Duplicate instrument serial number found!');
        setSaveError('This Instrument Serial Number Already Exists');
        return;
      }

      console.log('✅ [ADD_INSTRUMENT] No duplicate serial number found');

      // Step 2: Check for duplicate instrument with working area
      console.log('🔧 [ADD_INSTRUMENT] ===== CHECKING DUPLICATE INSTRUMENT WITH WORKING AREA =====');
      console.log('🔧 [ADD_INSTRUMENT] Current instruments list:', instruments);
      
      const selectedInstrumentValue = selectedInstrumentList.find(item => item.name === instrument)?.value;
      console.log('🔧 [ADD_INSTRUMENT] Selected instrument value:', selectedInstrumentValue);
      
      const instrumentToCheck = {
        applicationInstrumentsType: selectedInstrumentValue,
        districtRefId: district,
        tehsilRefId: tehsil
      };
      console.log('🔧 [ADD_INSTRUMENT] Instrument to check for duplication:', instrumentToCheck);

      const exists = instruments.some((existingInstrument: any) =>
        existingInstrument.instrumentType === instrument &&
        existingInstrument.district === districts.find(d => d.districtCode === district)?.districtName &&
        existingInstrument.tehsil === tehsils.find(t => t.tehsilId === tehsil)?.tehsilName
      );
      
      console.log('🔧 [ADD_INSTRUMENT] Duplicate instrument with working area exists:', exists);
      
      if (exists) {
        console.log('❌ [ADD_INSTRUMENT] Duplicate instrument with working area found!');
        setSaveError('This instrument is already added for the selected working area');
        return;
      }

      console.log('✅ [ADD_INSTRUMENT] No duplicate instrument with working area found');

      // Step 3: Prepare instrument payload
      console.log('🔧 [ADD_INSTRUMENT] ===== PREPARING INSTRUMENT PAYLOAD =====');
      
      // Find district and tehsil names for display and payload
      const selectedDistrict = districts.find(d => d.districtCode === district);
      const selectedTehsil = tehsils.find(t => t.tehsilId === tehsil);
      
      console.log('🔧 [ADD_INSTRUMENT] Selected district:', selectedDistrict);
      console.log('🔧 [ADD_INSTRUMENT] Selected tehsil:', selectedTehsil);
      
      // Get instrument range unit mapping
      const rangeUnitMapping: { [key: string]: number } = {
        'V': 1,    // Volt (V)
        'A': 2,    // Amp (A) 
        'Ω': 3,    // Ohm (Ω)
        // Add more mappings as needed based on Angular
      };
      
      const instrumentPayload: InstrumentPayload = {
        contactInstrumentId: 0,
        appRefId: applicationId,
        applicationInstrumentsType: selectedInstrumentValue || 1,
        instrumentSerialNo: instrumentSerialNo.toUpperCase(),
        instrumentMakeBy: instrumentMake,
        instrumentStartRange: instrumentRangeFrom,
        instrumentEndRange: instrumentRangeTo,
        applicationInstrumentRange: rangeUnitMapping[instrumentRangeUnit] || 1,
        isActive: true,
        isDeleted: false,
        createdOnDate: new Date().toISOString(),
        lastModifiedOnDate: new Date().toISOString(),
        districtRefId: district as number,
        districtName: selectedDistrict?.districtName || district.toString(),
        tehsilRefId: tehsil as number,
        tehsilName: selectedTehsil?.tehsilName || tehsil.toString()
      };

      console.log('🔧 [ADD_INSTRUMENT] ===== FINAL INSTRUMENT PAYLOAD =====');
      console.log('🔧 [ADD_INSTRUMENT] Raw payload object:', instrumentPayload);
      console.log('🔧 [ADD_INSTRUMENT] Payload details:');
      console.log('🔧 [ADD_INSTRUMENT] - contactInstrumentId:', instrumentPayload.contactInstrumentId);
      console.log('🔧 [ADD_INSTRUMENT] - appRefId:', instrumentPayload.appRefId);
      console.log('🔧 [ADD_INSTRUMENT] - applicationInstrumentsType:', instrumentPayload.applicationInstrumentsType);
      console.log('🔧 [ADD_INSTRUMENT] - instrumentSerialNo:', instrumentPayload.instrumentSerialNo);
      console.log('🔧 [ADD_INSTRUMENT] - instrumentMakeBy:', instrumentPayload.instrumentMakeBy);
      console.log('🔧 [ADD_INSTRUMENT] - instrumentStartRange:', instrumentPayload.instrumentStartRange);
      console.log('🔧 [ADD_INSTRUMENT] - instrumentEndRange:', instrumentPayload.instrumentEndRange);
      console.log('🔧 [ADD_INSTRUMENT] - applicationInstrumentRange:', instrumentPayload.applicationInstrumentRange);
      console.log('🔧 [ADD_INSTRUMENT] - districtRefId:', instrumentPayload.districtRefId);
      console.log('🔧 [ADD_INSTRUMENT] - districtName:', instrumentPayload.districtName);
      console.log('🔧 [ADD_INSTRUMENT] - tehsilRefId:', instrumentPayload.tehsilRefId);
      console.log('🔧 [ADD_INSTRUMENT] - tehsilName:', instrumentPayload.tehsilName);
      console.log('🔧 [ADD_INSTRUMENT] - isActive:', instrumentPayload.isActive);
      console.log('🔧 [ADD_INSTRUMENT] - isDeleted:', instrumentPayload.isDeleted);
      console.log('🔧 [ADD_INSTRUMENT] - createdOnDate:', instrumentPayload.createdOnDate);
      console.log('🔧 [ADD_INSTRUMENT] - lastModifiedOnDate:', instrumentPayload.lastModifiedOnDate);

      // Step 4: Call the API
      console.log('🌐 [ADD_INSTRUMENT] ===== MAKING API CALL =====');
      console.log('🌐 [ADD_INSTRUMENT] API Controller: ContractorLicence');
      console.log('🌐 [ADD_INSTRUMENT] API Action: addUpdateContract_InstrumentDetails');
      console.log('🌐 [ADD_INSTRUMENT] Sending payload to backend...');
      
      const result = await userDetailsService.addInstrument(instrumentPayload);

      console.log('📡 [ADD_INSTRUMENT] ===== ADD INSTRUMENT API RESPONSE =====');
      console.log('📡 [ADD_INSTRUMENT] Response data:', result);
      console.log('📡 [ADD_INSTRUMENT] Response status:', result.status);

      if (result?.success || result?.data || result.status === 200) {
        console.log('✅ [ADD_INSTRUMENT] Instrument added successfully!');
        
        console.log('🔧 [ADD_INSTRUMENT] ===== POST-SUCCESS OPERATIONS =====');
        console.log('🔧 [ADD_INSTRUMENT] Updating local state...');
        
        // Add to local state for immediate UI update
        const newInstrument: Instrument = {
          id: Date.now(),
          instrumentType: instrument,
          instrumentSerialNo,
          instrumentMake,
          instrumentRange: `${instrumentRangeFrom}-${instrumentRangeTo} ${instrumentRangeUnit}`,
          district: selectedDistrict?.districtName || district.toString(),
          tehsil: selectedTehsil?.tehsilName || tehsil.toString(),
          action: 'Delete'
        };
        
        setInstruments([...instruments, newInstrument]);
        
        console.log('🔧 [ADD_INSTRUMENT] ===== CLEARING FORM FIELDS =====');
        console.log('🔧 [ADD_INSTRUMENT] Form values before reset:', {
          instrument,
          instrumentSerialNo,
          instrumentMake,
          instrumentRangeFrom,
          instrumentRangeTo,
          instrumentRangeUnit,
          district,
          tehsil
        });
        
        // Clear form fields only on success
        setInstrument("");
        setInstrumentSerialNo("");
        setInstrumentMake("");
        setInstrumentRangeFrom("");
        setInstrumentRangeTo("");
        setInstrumentRangeUnit("");
        setDistrict("");
        setTehsil("");
        resetTehsils();
        
        console.log('🔧 [ADD_INSTRUMENT] Form values after reset:', {
          instrument: "",
          instrumentSerialNo: "",
          instrumentMake: "",
          instrumentRangeFrom: "",
          instrumentRangeTo: "",
          instrumentRangeUnit: "",
          district: "",
          tehsil: ""
        });
        
        console.log('🔧 [ADD_INSTRUMENT] Form submission flag reset');
        console.log('🔄 [ADD_INSTRUMENT] ===== REFRESHING DATA =====');
        console.log('🔄 [ADD_INSTRUMENT] Calling getContractorApplicationDetailsById to refresh data');
        
        // Refresh data like Angular does
        try {
          const refreshResult = await userDetailsService.getContractorApplicationDetailsById(applicationId);
          console.log('✅ [ADD_INSTRUMENT] Data refreshed successfully:', refreshResult);
        } catch (refreshError) {
          console.error('❌ [ADD_INSTRUMENT] Error refreshing data:', refreshError);
        }
        
        console.log('✅ [ADD_INSTRUMENT] ===== ADD INSTRUMENT COMPLETED SUCCESSFULLY =====');
        setSaveSuccess('Instrument added successfully!');
        
      } else {
        console.error('❌ [ADD_INSTRUMENT] Failed to add instrument - API returned false');
        setSaveError('Failed to add instrument');
      }
    } catch (error: any) {
      console.error('❌ [ADD_INSTRUMENT] ===== API ERROR OCCURRED =====');
      console.error('❌ [ADD_INSTRUMENT] Error Object:', error);
      console.error('❌ [ADD_INSTRUMENT] Error Status:', error?.status);
      console.error('❌ [ADD_INSTRUMENT] Error Message:', error?.message);
      console.error('❌ [ADD_INSTRUMENT] Error Response Body:', error?.response?.data);
      setSaveError(error?.response?.data?.message || error?.message || 'Failed to add instrument');
    }
  };

  const handleDeleteWorkingArea = (id: number) => {
    setWorkingAreas(workingAreas.filter(area => area.id !== id));
  };

  const handleDeleteInstrument = (id: number) => {
    setInstruments(instruments.filter(instrument => instrument.id !== id));
  };

  const handleBack = () => {
    navigate(-1);
  };

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

  // Show initial loading screen while fetching user data
  if (isInitialLoad && apiLoading) {
    return (
      <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center" style={{ paddingTop: '80px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading applicant details...</p>
        </div>
      </div>
    );
  }

  // Handle add partner
  const handleFileUploaded = (info: { formControlName: string; serverResponse: any }) => {
    console.log('📁 [CONTRACTOR-FORM] File upload callback:', info);
    const { formControlName, serverResponse } = info;
    
    const fileName = serverResponse.generatedFileNames.replace(/^,/, "");
    const fileUrl = `${import.meta.env.VITE_UPLOAD_URL}Uploads/Documents/TempFiles/${fileName.trim()}`;
    
    console.log('📁 [CONTRACTOR-FORM] Generated file name:', fileName);
    console.log('📁 [CONTRACTOR-FORM] Preview URL:', fileUrl);

    if (formControlName === 'partnerPhoto') {
      setPartnerPhoto(fileName);
      setPartnerPhotoPreviewUrl(fileUrl);
    } else if (formControlName === 'uploadPan') {
      setUploadPan(fileName);
      setUploadPanPreviewUrl(fileUrl);
    }
  };

  // Enhanced handleAddPartner with API integration (matching Angular implementation exactly)
  const handleAddPartner = async () => {
    console.log('🤝 [ADD_PARTNER] ===== FUNCTION STARTED =====');
    console.log('🤝 [ADD_PARTNER] Function: handleAddPartner() started');
    console.log('🤝 [ADD_PARTNER] Current applicationId:', applicationId);
    console.log('🤝 [ADD_PARTNER] Partner form values:', {
      partnerName,
      partnerEmail,
      partnerContactNumber,
      partnerPhoto,
      uploadPan,
      panNo
    });

    // Validate required fields
    if (!partnerName || !partnerEmail || !partnerContactNumber || !panNo || !partnerPhoto || !uploadPan) {
      console.log('❌ [ADD_PARTNER] Form validation failed - missing required fields');
      console.log('❌ [ADD_PARTNER] Missing fields:', {
        partnerName: !partnerName,
        partnerEmail: !partnerEmail,
        partnerContactNumber: !partnerContactNumber,
        panNo: !panNo,
        partnerPhoto: !partnerPhoto,
        uploadPan: !uploadPan
      });
      setSaveError('Please fill all required fields');
      return;
    }

    console.log('✅ [ADD_PARTNER] Form validation passed');
    console.log('✅ [ADD_PARTNER] apprefId exists, proceeding with partner creation');

    try {
      console.log('🔍 [ADD_PARTNER] ===== PAN NUMBER VALIDATION =====');
      console.log('🔍 [ADD_PARTNER] Checking if PAN number already exists');
      console.log('🔍 [ADD_PARTNER] PAN number to check:', panNo);
      console.log('🔍 [ADD_PARTNER] API endpoint: ProjectSites/getProjectSitesPanDetails');
      console.log('🔍 [ADD_PARTNER] API payload:', { panno: panNo });
      
      // First validate PAN number
      const panValidationResponse = await userDetailsService.validatePANNumber(panNo);
      
      console.log('📥 [ADD_PARTNER] ===== PAN VALIDATION RESPONSE =====');
      console.log('📥 [ADD_PARTNER] PAN validation response received:', panValidationResponse);
      console.log('📥 [ADD_PARTNER] Response formModel:', panValidationResponse.data?.formModel);
      console.log('📥 [ADD_PARTNER] Is PAN already exists:', panValidationResponse.data?.formModel !== null);
      
      if (panValidationResponse.data?.formModel !== null) {
        console.log('❌ [ADD_PARTNER] PAN number already exists');
        const errorMessage = `PAN Number already exists, please try different PAN Number`;
        setSaveError(errorMessage);
        return;
      }

      console.log('✅ [ADD_PARTNER] PAN number is unique, proceeding with partner creation');
      console.log('📦 [ADD_PARTNER] ===== CREATING PARTNER PAYLOAD =====');
      
      const partnerPayload: PartnerPayload = {
        contactPartnershipId: 0,
        appRefId: applicationId, // Using the same app ID as Angular (3596)
        contrPartnerName: partnerName,
        contrPartnerEmail: partnerEmail,
        contrPartnerContactNo: partnerContactNumber,
        contrPartnerPhoto: partnerPhoto,
        panNoPhoto: uploadPan,
        panNo: panNo,
        isActive: true,
        isDeleted: false,
        createdOnDate: new Date().toISOString(),
        lastModifiedOnDate: new Date().toISOString(),
      };

      console.log('📦 [ADD_PARTNER] Partner payload created:', partnerPayload);
      console.log('📦 [ADD_PARTNER] Payload structure breakdown:');
      console.log('📦 [ADD_PARTNER] - contactPartnershipId:', partnerPayload.contactPartnershipId);
      console.log('📦 [ADD_PARTNER] - appRefId:', partnerPayload.appRefId);
      console.log('📦 [ADD_PARTNER] - contrPartnerName:', partnerPayload.contrPartnerName);
      console.log('📦 [ADD_PARTNER] - contrPartnerEmail:', partnerPayload.contrPartnerEmail);
      console.log('📦 [ADD_PARTNER] - contrPartnerContactNo:', partnerPayload.contrPartnerContactNo);
      console.log('📦 [ADD_PARTNER] - contrPartnerPhoto:', partnerPayload.contrPartnerPhoto);
      console.log('📦 [ADD_PARTNER] - panNoPhoto:', partnerPayload.panNoPhoto);
      console.log('📦 [ADD_PARTNER] - panNo:', partnerPayload.panNo);
      console.log('📦 [ADD_PARTNER] - isActive:', partnerPayload.isActive);
      console.log('📦 [ADD_PARTNER] - isDeleted:', partnerPayload.isDeleted);
      console.log('📦 [ADD_PARTNER] - createdOnDate:', partnerPayload.createdOnDate);
      console.log('📦 [ADD_PARTNER] - lastModifiedOnDate:', partnerPayload.lastModifiedOnDate);

      console.log('🌐 [ADD_PARTNER] ===== MAKING API CALL =====');
      console.log('🌐 [ADD_PARTNER] API Controller: ContractorLicence');
      console.log('🌐 [ADD_PARTNER] API Action: addUpdateContract_PartnerDetails');
      console.log('🌐 [ADD_PARTNER] Full API URL: /ContractorLicence/addUpdateContract_PartnerDetails');
      console.log('🌐 [ADD_PARTNER] HTTP Method: POST');
      console.log('📤 [ADD_PARTNER] RAW PAYLOAD (before encryption):', JSON.stringify(partnerPayload, null, 2));

      // Call the API
      const result = await userDetailsService.addPartner(partnerPayload);

      console.log('📥 [ADD_PARTNER] ===== API RESPONSE RECEIVED =====');
      console.log('📥 [ADD_PARTNER] Partner creation response:', result);
      console.log('📥 [ADD_PARTNER] Response type:', typeof result.data);
      console.log('📥 [ADD_PARTNER] Response keys:', result.data ? Object.keys(result.data) : 'No keys (null/undefined response)');

      if (result?.success || result?.data) {
        console.log('✅ [ADD_PARTNER] Partner added successfully via Angular-compatible API');
        
        console.log('🔧 [ADD_PARTNER] ===== POST-RESPONSE PROCESSING =====');
        console.log('🔧 [ADD_PARTNER] Clearing form fields...');
        
        // Add to local state for immediate UI update
        const newPartner: Partner = {
          id: Date.now(),
          name: partnerName,
          email: partnerEmail,
          mobileNumber: partnerContactNumber,
          photo: partnerPhoto || 'No file chosen',
          pan: uploadPan || 'No file chosen',
          panNo: panNo,
          action: 'Delete'
        };
        setPartners([...partners, newPartner]);
        
        // Clear form fields only on success
        setPartnerName("");
        setPartnerEmail("");
        setPartnerContactNumber("");
        setPanNo("");
        setPartnerPhoto("");
        setUploadPan("");
        setPartnerPhotoPreviewUrl("");
        setUploadPanPreviewUrl("");
        
        console.log('🔧 [ADD_PARTNER] Form values after clearing:', {
          partnerName: "",
          partnerEmail: "",
          partnerContactNumber: "",
          panNo: "",
          partnerPhoto: "",
          uploadPan: ""
        });
        
        console.log('🔧 [ADD_PARTNER] Form state after reset:');
        console.log('🔧 [ADD_PARTNER] Photo fields cleared');
        console.log('🔧 [ADD_PARTNER] - partnerPhoto:', "");
        console.log('🔧 [ADD_PARTNER] - uploadPan:', "");
        
        console.log('🔄 [ADD_PARTNER] ===== REFRESHING DATA =====');
        console.log('🔄 [ADD_PARTNER] Calling getContractorApplicationDetailsById to refresh partner list');
        
        // Refresh data like Angular does
        try {
          const refreshResult = await userDetailsService.getContractorApplicationDetailsById(applicationId);
          console.log('✅ [ADD_PARTNER] Partner list refreshed successfully:', refreshResult);
        } catch (refreshError) {
          console.error('❌ [ADD_PARTNER] Error refreshing partner list:', refreshError);
        }
        
      } else {
        console.error('❌ [ADD_PARTNER] Failed to add partner - API returned false');
      }
    } catch (error: any) {
      console.error('❌ [ADD_PARTNER] ===== API ERROR OCCURRED =====');
      console.error('❌ [ADD_PARTNER] Error Object:', error);
      console.error('❌ [ADD_PARTNER] Error Status:', error?.status);
      console.error('❌ [ADD_PARTNER] Error Message:', error?.message);
      console.error('❌ [ADD_PARTNER] Error Response Body:', error?.response?.data);
      setSaveError(error?.response?.data?.message || error?.message || 'Failed to add partner');
    }
  };

  const handleDeletePartner = (id: number) => {
    setPartners(partners.filter(partner => partner.id !== id));
  };

  // Check if contractor type requires business entity fields
  const showBusinessEntityFields = contractorType && contractorType !== "Individual";
  const showPartnerSection = contractorType && contractorType !== "Individual";

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
            {(saveSuccess || saveError || contractorError) && (
              <div className={`alert ${saveSuccess ? 'alert-success' : 'alert-danger'} d-flex align-items-center mb-4`} role="alert">
                <i className={`bi ${saveSuccess ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                <div className="flex-grow-1">
                  {saveSuccess || saveError || contractorError}
                </div>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => {
                    setSaveSuccess(null);
                    setSaveError(null);
                    clearContractorError();
                  }}
                >
                  <i className="bi bi-x"></i>
                </Button>
              </div>
            )}

            {/* API Error Display */}
            {apiError && (
              <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div className="flex-grow-1">
                  <strong>Notice:</strong> Could not load some applicant details. Please fill them manually.
                </div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => refreshData()}
                  disabled={apiLoading}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Retry
                </Button>
              </div>
            )}
            
            {/* Applicant Details Section */}
            <div className="applicant-details-section mb-5 border-3 shadow-xl">
              <div className="section-header mb-4">
                <h6 className="text-primary fw-semibold mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  Applicant Details
                  {apiLoading && (
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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value)}
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
                      <option value="Proprietorship">Proprietorship</option>
                      <option value="Private Limited">Private Limited</option>
                      <option value="Public Limited">Public Limited</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Individual">Individual</option>
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
                      <option value="Low/Medium Voltage">Low/Medium Voltage</option>
                      <option value="High Voltage">High Voltage</option>
                      <option value="Extra High Voltage">Extra High Voltage</option>
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
                      disabled={loading.districts || contractorSaving}
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
                      Working On Tehsil <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={workingOnTehsil}
                      onChange={(e) => setWorkingOnTehsil(Number(e.target.value) || "")}
                      className="form-control-custom"
                      disabled={loading.tehsils || !workingOnDistrict || contractorSaving}
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
                        {locationErrors.tehsils}
                      </div>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button
                    variant="primary"
                    onClick={handleAddWorkingArea}
                    className="btn-custom w-100"
                    style={{ height: '38px' }}
                    disabled={!workingOnDistrict || !workingOnTehsil || contractorSaving}
                  >
                    {contractorSaving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Working Area
                      </>
                    )}
                  </Button>
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
                      <option value="V">Volts (V)</option>
                      <option value="A">Amperes (A)</option>
                      <option value="Ω">Ohms (Ω)</option>
                      <option value="MΩ">Mega Ohm (MΩ)</option>
                      <option value="KV">Kilo Volt (KV)</option>
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
                      value={district}
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
                      value={tehsil}
                      onChange={(e) => setTehsil(Number(e.target.value) || "")}
                      className="form-control-custom"
                      disabled={loading.tehsils || !district}
                    >
                      <option value="">-Select Tehsil-</option>
                      {!loading.tehsils && tehsils.length === 0 && district && (
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
                      !district || 
                      !tehsil ||
                      selectedInstrumentList.length === 0 ||
                      apiLoading
                    }
                  >
                    {apiLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Adding Instrument...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Instrument
                      </>
                    )}
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