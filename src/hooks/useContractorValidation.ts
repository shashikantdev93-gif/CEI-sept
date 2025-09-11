import Swal from 'sweetalert2';

interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  details?: any;
}

interface FormValidationProps {
  applicant_name: string;
  address: string;
  panCardNumber: string;
  contractorType: string;
  currentWorkingVoltage: string;
  signeeNameOnBehalfOfCompany?: string;
  businessEntity?: string;
  businessEntityAddress?: string;
}

interface WorkingArea {
  districtRefId: number;
  tehsilRefId: number;
  district: string;
  tehsil: string;
}

interface Instrument {
  districtRefId: number;
  tehsilRefId: number;
  instrumentType: string;
  applicationInstrumentsType?: number;
}

export const useContractorValidation = () => {
  
  /**
   * Validate form fields (Angular parity)
   * Angular: this.applicantDetailsForm.valid
   */
  const validateForm = (formData: FormValidationProps): ValidationResult => {
    console.log('💾 [VALIDATION] ===== FORM VALIDATION =====');
    console.log('💾 [VALIDATION] Form data:', formData);
    
    const errors: string[] = [];
    
    // Required fields validation
    if (!formData.applicant_name?.trim()) {
      errors.push('Applicant name is required');
    }
    
    if (!formData.address?.trim()) {
      errors.push('Address is required');
    }
    
    if (!formData.panCardNumber?.trim()) {
      errors.push('PAN card number is required');
    }
    
    if (!formData.contractorType) {
      errors.push('Contractor type is required');
    }
    
    if (!formData.currentWorkingVoltage) {
      errors.push('Working voltage type is required');
    }
    
    // Conditional validation for business entity fields
    const showBusinessEntityFields = formData.contractorType && formData.contractorType !== "Individual";
    
    if (showBusinessEntityFields) {
      if (!formData.signeeNameOnBehalfOfCompany?.trim()) {
        errors.push('Signee name on behalf of company is required');
      }
      
      if (!formData.businessEntity?.trim()) {
        errors.push('Business entity is required');
      }
      
      if (!formData.businessEntityAddress?.trim()) {
        errors.push('Business entity address is required');
      }
    }
    
    const isValid = errors.length === 0;
    
    console.log('💾 [VALIDATION] Form validation result:', { isValid, errors });
    
    return { isValid, errors };
  };
  
  /**
   * Validate working areas (Angular parity)
   * Angular: if (this.workingAreaList?.length === 0)
   */
  const validateWorkingAreas = (workingAreaList: WorkingArea[]): ValidationResult => {
    console.log('💾 [VALIDATION] ===== WORKING AREA VALIDATION =====');
    console.log('💾 [VALIDATION] Working area list:', workingAreaList);
    console.log('💾 [VALIDATION] Working area list length:', workingAreaList?.length);
    
    if (!workingAreaList || workingAreaList.length === 0) {
      console.log('❌ [VALIDATION] No working areas found');
      return {
        isValid: false,
        errors: ['Please add at least one working area before proceeding.']
      };
    }
    
    console.log('✅ [VALIDATION] Working area validation passed');
    return { isValid: true };
  };
  
  /**
   * Validate instruments (Angular complex matrix validation)
   * Angular: Complex validation logic for instruments × working areas
   */
  const validateInstruments = (
    instrumentsList: Instrument[], 
    selectedInstrumentList: any[], 
    workingAreaList: WorkingArea[]
  ): ValidationResult => {
    console.log('💾 [VALIDATION] ===== INSTRUMENT VALIDATION =====');
    console.log('💾 [VALIDATION] Instruments list:', instrumentsList);
    console.log('💾 [VALIDATION] Instruments list length:', instrumentsList?.length);
    console.log('💾 [VALIDATION] Selected instrument list:', selectedInstrumentList);
    console.log('💾 [VALIDATION] Selected instrument list length:', selectedInstrumentList?.length);
    console.log('💾 [VALIDATION] Expected instruments count (selectedInstruments * workingAreas):', 
                selectedInstrumentList?.length * workingAreaList?.length);
    console.log('💾 [VALIDATION] Actual instruments count:', instrumentsList?.length);

    // Complex validation: Each working area must have all selected instrument types
    const expectedInstrumentCount = (selectedInstrumentList?.length || 0) * (workingAreaList?.length || 0);
    const actualInstrumentCount = instrumentsList?.length || 0;

    if (actualInstrumentCount !== expectedInstrumentCount) {
      console.log('❌ [VALIDATION] Instrument validation failed');
      console.log(`❌ [VALIDATION] Expected: ${expectedInstrumentCount}, Actual: ${actualInstrumentCount}`);
      
      return {
        isValid: false,
        errors: [`Please add instruments for all working areas. Required: ${expectedInstrumentCount}, Added: ${actualInstrumentCount}`],
        details: { expected: expectedInstrumentCount, actual: actualInstrumentCount }
      };
    }

    // Validate instrument coverage for each working area
    for (const workingArea of workingAreaList) {
      for (const instrumentType of selectedInstrumentList) {
        const hasInstrument = instrumentsList.some(instrument => 
          instrument.districtRefId === workingArea.districtRefId &&
          instrument.tehsilRefId === workingArea.tehsilRefId &&
          (instrument.applicationInstrumentsType === instrumentType.value || 
           instrument.instrumentType === instrumentType.value || 
           instrument.instrumentType === instrumentType.name)
        );

        if (!hasInstrument) {
          console.log('❌ [VALIDATION] Missing instrument for area:', workingArea, 'type:', instrumentType);
          return {
            isValid: false,
            errors: [`Please add ${instrumentType.name || instrumentType.value} for ${workingArea.district}, ${workingArea.tehsil}`],
            details: { missingInstrument: instrumentType, missingArea: workingArea }
          };
        }
      }
    }

    console.log('✅ [VALIDATION] Instrument validation passed - all required instruments are added');
    return { isValid: true };
  };
  
  /**
   * Show validation errors with SweetAlert (Angular parity)
   */
  const showValidationErrors = (errors: string[]) => {
    console.log('❌ [VALIDATION] Showing validation errors:', errors);
    
    const errorMessage = errors.length === 1 
      ? errors[0] 
      : `Please fix the following errors:\n${errors.map((error, index) => `${index + 1}. ${error}`).join('\n')}`;
    
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: errorMessage,
      confirmButtonText: 'OK'
    });
  };
  
  /**
   * Show working area error (Angular parity)
   */
  const showWorkingAreaError = () => {
    console.log('❌ [VALIDATION] Showing working area error');
    
    Swal.fire({
      icon: 'warning',
      title: 'Working Area Required',
      text: 'Please add at least one working area before proceeding.',
      confirmButtonText: 'OK'
    });
  };
  
  /**
   * Show instrument error (Angular parity)
   */
  const showInstrumentError = (details: any) => {
    console.log('❌ [VALIDATION] Showing instrument error:', details);
    
    if (details?.missingInstrument && details?.missingArea) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Instrument',
        text: `Please add ${details.missingInstrument.name || details.missingInstrument.value} for ${details.missingArea.district}, ${details.missingArea.tehsil}`,
        confirmButtonText: 'OK'
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Instrument Details',
        text: `Please add instruments for all working areas. Required: ${details?.expected || 0}, Added: ${details?.actual || 0}`,
        confirmButtonText: 'OK'
      });
    }
  };
  
  /**
   * Calculate license validity dates (Angular parity)
   * Angular: Voltage-based years calculation
   */
  const calculateLicenseValidity = (voltageType: string) => {
    console.log('📅 [VALIDATION] Calculating license validity for voltage type:', voltageType);
    
    const currentDate = new Date();
    const voltageTypeInt = parseInt(voltageType);
    const licenceNoOfYear = voltageTypeInt === 1 ? 1 : voltageTypeInt === 2 ? 2 : 1;
    const licenceValidUpto = new Date(
      currentDate.getFullYear() + licenceNoOfYear,
      currentDate.getMonth(),
      currentDate.getDate()
    );

    console.log('📅 [VALIDATION] Calculated licence valid upto:', licenceValidUpto);
    console.log('📅 [VALIDATION] Calculated licence number of years:', licenceNoOfYear);
    
    return {
      licenceNoOfYear,
      licenceValidUpto,
      currentDate
    };
  };
  
  /**
   * Detect working voltage change (Angular parity)
   * Angular: Change detection for renewals
   */
  const detectWorkingVoltageChange = (currentVoltage: string, previousVoltage?: string): boolean => {
    if (!previousVoltage) return false;
    
    const isWorkingVoltageChange = parseInt(previousVoltage) !== parseInt(currentVoltage);
    console.log('🔄 [VALIDATION] Working voltage change detection:', { 
      currentVoltage, 
      previousVoltage, 
      isWorkingVoltageChange 
    });
    
    return isWorkingVoltageChange;
  };
  
  return {
    validateForm,
    validateWorkingAreas,
    validateInstruments,
    showValidationErrors,
    showWorkingAreaError,
    showInstrumentError,
    calculateLicenseValidity,
    detectWorkingVoltageChange
  };
};
