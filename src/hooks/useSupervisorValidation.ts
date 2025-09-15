import { useState, useCallback } from 'react';
import { FormValidators } from '../utils/validators';
import { useCertificateValidation } from './useCertificateValidation';
import { useWorkingAreaLogic } from './useWorkingAreaLogic';
import type { 
  SupervisorFormData, 
  WiremanFormData, 
  SupervisorFormErrors, 
  WiremanFormErrors 
} from '../types/supervisor.types';
import { 
  EMPTY_SUPERVISOR_FORM, 
  EMPTY_WIREMAN_FORM,
  SUPERVISOR_VALIDATION_MESSAGES 
} from '../constants/supervisor';

export const useSupervisorValidation = () => {
  const [supervisorForm, setSupervisorForm] = useState<SupervisorFormData>(EMPTY_SUPERVISOR_FORM);
  const [wiremanForm, setWiremanForm] = useState<WiremanFormData>(EMPTY_WIREMAN_FORM);
  const [supervisorErrors, setSupervisorErrors] = useState<SupervisorFormErrors>({});
  const [wiremanErrors, setWiremanErrors] = useState<WiremanFormErrors>({});

  // Certificate validation hook
  const {
    isValidatingSupervisor,
    isValidatingWireman,
    debouncedValidateSupervisor,
    debouncedValidateWireman
  } = useCertificateValidation();

  // Working area logic hook
  const workingAreaLogic = useWorkingAreaLogic();

  // Real-time field validation
  const validateField = useCallback((
    fieldName: string, 
    value: string, 
    formType: 'supervisor' | 'wireman'
  ): string => {
    let error = '';
    
    switch (fieldName) {
      case 'fullName':
        const requiredCheck = FormValidators.required(value);
        if (!requiredCheck.isValid) {
          error = requiredCheck.error || '';
        } else {
          const nameCheck = FormValidators.supervisorName(value);
          if (!nameCheck.isValid) {
            error = nameCheck.error || '';
          }
        }
        break;
        
      case 'licenceNo':
        const licenceRequiredCheck = FormValidators.required(value);
        if (!licenceRequiredCheck.isValid) {
          error = licenceRequiredCheck.error || '';
        } else {
          const licenceCheck = FormValidators.licenceNumber(value);
          if (!licenceCheck.isValid) {
            error = licenceCheck.error || '';
          }
        }
        break;
        
      case 'licenceValidUpto':
        const dateCheck = FormValidators.futureDate(value);
        if (!dateCheck.isValid) {
          error = dateCheck.error || '';
        }
        break;
        
      case 'panNo':
        const panRequiredCheck = FormValidators.required(value);
        if (!panRequiredCheck.isValid) {
          error = panRequiredCheck.error || '';
        } else {
          const panCheck = FormValidators.pan(value);
          if (!panCheck.isValid) {
            error = panCheck.error || '';
          }
        }
        break;
        
      case 'districtRefId':
        const districtCheck = FormValidators.dropdownSelection(value);
        if (!districtCheck.isValid) {
          error = SUPERVISOR_VALIDATION_MESSAGES.DISTRICT_REQUIRED;
        }
        break;
        
      case 'tehsilRefId':
        const tehsilCheck = FormValidators.dropdownSelection(value);
        if (!tehsilCheck.isValid) {
          error = SUPERVISOR_VALIDATION_MESSAGES.TEHSIL_REQUIRED;
        }
        break;
        
      case 'licenceDocument':
        const licenceDocCheck = FormValidators.required(value);
        if (!licenceDocCheck.isValid) {
          error = 'License document is required';
        }
        break;
        
      case 'panNoDocument':
        const panDocCheck = FormValidators.required(value);
        if (!panDocCheck.isValid) {
          error = 'PAN document is required';
        }
        break;
    }
    
    // Update error state
    if (formType === 'supervisor') {
      setSupervisorErrors(prev => ({ ...prev, [fieldName]: error }));
    } else {
      setWiremanErrors(prev => ({ ...prev, [fieldName]: error }));
    }
    
    return error;
  }, []);

  // Field change handlers with validation
  const handleSupervisorFieldChange = useCallback((fieldName: string, value: string) => {
    setSupervisorForm(prev => ({ ...prev, [fieldName]: value }));
    validateField(fieldName, value, 'supervisor');
  }, [validateField]);

  const handleWiremanFieldChange = useCallback((fieldName: string, value: string) => {
    setWiremanForm(prev => ({ ...prev, [fieldName]: value }));
    validateField(fieldName, value, 'wireman');
  }, [validateField]);

  // Certificate validation handlers (matching Angular debounce pattern - updated with renewAppId support)
  const handleSupervisorCertificateChange = useCallback((
    licenceNo: string, 
    isOnlineMode: boolean,
    contractorFormMode: 'new' | 'renew' = 'new',
    renewAppId?: number
  ) => {
    if (licenceNo.trim()) {
      debouncedValidateSupervisor(licenceNo, isOnlineMode, (result) => {
        if (result.isValid && !result.isExpired) {
          // Auto-fill fields for online mode (matching Angular behavior)
          if (isOnlineMode && result.fullName && result.licenceValidUpto && result.panNo) {
            setSupervisorForm(prev => ({
              ...prev,
              fullName: result.fullName || '',
              licenceValidUpto: result.licenceValidUpto || '',
              panNo: result.panNo || ''
            }));
          }
          // Clear any certificate-specific errors
          setSupervisorErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.licenceNo;
            return newErrors;
          });
        } else {
          // Handle validation failure
          if (result.message) {
            setSupervisorErrors(prev => ({
              ...prev,
              licenceNo: result.message || ''
            }));
          }
          // Clear fields for invalid certificates
          if (result.isExpired || !result.isValid) {
            setSupervisorForm(prev => ({
              ...prev,
              licenceNo: result.isExpired ? '' : prev.licenceNo,
              fullName: isOnlineMode ? '' : prev.fullName,
              licenceValidUpto: isOnlineMode ? '' : prev.licenceValidUpto,
              panNo: isOnlineMode ? '' : prev.panNo
            }));
          }
        }
      }, contractorFormMode, renewAppId);
    }
  }, [debouncedValidateSupervisor]);

  const handleWiremanCertificateChange = useCallback((
    licenceNo: string, 
    isOnlineMode: boolean,
    contractorFormMode: 'new' | 'renew' = 'new',
    renewAppId?: number
  ) => {
    if (licenceNo.trim()) {
      debouncedValidateWireman(licenceNo, isOnlineMode, (result) => {
        if (result.isValid && !result.isExpired) {
          // Auto-fill fields for online mode (matching Angular behavior)
          if (isOnlineMode && result.fullName && result.licenceValidUpto && result.panNo) {
            setWiremanForm(prev => ({
              ...prev,
              fullName: result.fullName || '',
              licenceValidUpto: result.licenceValidUpto || '',
              panNo: result.panNo || ''
            }));
          }
          // Clear any certificate-specific errors
          setWiremanErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.licenceNo;
            return newErrors;
          });
        } else {
          // Handle validation failure
          if (result.message) {
            setWiremanErrors(prev => ({
              ...prev,
              licenceNo: result.message || ''
            }));
          }
          // Clear fields for invalid certificates
          if (result.isExpired || !result.isValid) {
            setWiremanForm(prev => ({
              ...prev,
              licenceNo: result.isExpired ? '' : prev.licenceNo,
              fullName: isOnlineMode ? '' : prev.fullName,
              licenceValidUpto: isOnlineMode ? '' : prev.licenceValidUpto,
              panNo: isOnlineMode ? '' : prev.panNo
            }));
          }
        }
      }, contractorFormMode, renewAppId);
    }
  }, [debouncedValidateWireman]);

  // Complete form validation
  const validateSupervisorForm = useCallback((): boolean => {
    const errors: SupervisorFormErrors = {};
    
    // Validate all fields
    Object.entries(supervisorForm).forEach(([fieldName, value]) => {
      const error = validateField(fieldName, value, 'supervisor');
      if (error) {
        errors[fieldName] = error;
      }
    });
    
    setSupervisorErrors(errors);
    return Object.keys(errors).length === 0;
  }, [supervisorForm, validateField]);

  const validateWiremanForm = useCallback((): boolean => {
    const errors: WiremanFormErrors = {};
    
    // Validate all fields
    Object.entries(wiremanForm).forEach(([fieldName, value]) => {
      const error = validateField(fieldName, value, 'wireman');
      if (error) {
        errors[fieldName] = error;
      }
    });
    
    setWiremanErrors(errors);
    return Object.keys(errors).length === 0;
  }, [wiremanForm, validateField]);

  // Reset forms
  const resetSupervisorForm = useCallback(() => {
    setSupervisorForm(EMPTY_SUPERVISOR_FORM);
    setSupervisorErrors({});
  }, []);

  const resetWiremanForm = useCallback(() => {
    setWiremanForm(EMPTY_WIREMAN_FORM);
    setWiremanErrors({});
  }, []);

  // Clear errors for disabled fields (online mode)
  const clearSupervisorOnlineErrors = useCallback(() => {
    setSupervisorErrors(prev => ({
      ...prev,
      fullName: '',
      licenceValidUpto: '',
      panNo: ''
    }));
  }, []);

  const clearWiremanOnlineErrors = useCallback(() => {
    setWiremanErrors(prev => ({
      ...prev,
      fullName: '',
      licenceValidUpto: '',
      panNo: ''
    }));
  }, []);

  return {
    // Form state
    supervisorForm,
    wiremanForm,
    supervisorErrors,
    wiremanErrors,
    
    // Setters
    setSupervisorForm,
    setWiremanForm,
    
    // Validation methods
    validateField,
    validateSupervisorForm,
    validateWiremanForm,
    
    // Change handlers
    handleSupervisorFieldChange,
    handleWiremanFieldChange,
    
    // Certificate validation handlers
    handleSupervisorCertificateChange,
    handleWiremanCertificateChange,
    
    // Loading states
    isValidatingSupervisor,
    isValidatingWireman,
    
    // Reset methods
    resetSupervisorForm,
    resetWiremanForm,
    clearSupervisorOnlineErrors,
    clearWiremanOnlineErrors,
    
    // Working area logic
    workingAreaLogic
  };
};
