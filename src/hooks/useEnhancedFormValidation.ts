import { useState, useCallback, useMemo } from 'react';
import type { ValidationResult } from '../utils/validators';
import { FormValidators } from '../utils/validators';

// Generic validation rule definition
export interface ValidationRule {
  validator: (value: any, formData?: any) => ValidationResult;
  when?: (formData: any) => boolean; // Conditional validation
  message?: string; // Override error message
}

// Field validation configuration
export interface FieldValidationConfig {
  [fieldName: string]: ValidationRule[];
}

// Form validation mode
export type ValidationMode = 'onChange' | 'onBlur' | 'onSubmit' | 'manual';

// Validation hook configuration
export interface EnhancedFormValidationConfig {
  validationRules: FieldValidationConfig;
  mode?: ValidationMode;
  showErrorsImmediately?: boolean;
  stopOnFirstError?: boolean;
  debounceMs?: number;
}

// Form validation state
export interface EnhancedFormValidationState {
  isValid: boolean;
  isValidating: boolean;
  errors: Record<string, string>;
  touchedFields: Set<string>;
  hasBeenSubmitted: boolean;
  fieldValidationResults: Record<string, ValidationResult>;
}

// Form validation result
export interface EnhancedFormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  firstError?: string;
  invalidFields: string[];
}

// Enhanced useFormValidation hook
export const useEnhancedFormValidation = <T extends Record<string, any>>(
  config: EnhancedFormValidationConfig
) => {
  const [validationState, setValidationState] = useState<EnhancedFormValidationState>({
    isValid: false,
    isValidating: false,
    errors: {},
    touchedFields: new Set(),
    hasBeenSubmitted: false,
    fieldValidationResults: {},
  });

  const { validationRules, mode = 'onChange', showErrorsImmediately = true, stopOnFirstError = false } = config;

  // Validate individual field
  const validateField = useCallback((
    fieldName: string, 
    value: any, 
    formData: T
  ): ValidationResult => {
    const fieldRules = validationRules[fieldName];
    if (!fieldRules || fieldRules.length === 0) {
      return { isValid: true };
    }

    for (const rule of fieldRules) {
      // Check conditional validation
      if (rule.when && !rule.when(formData)) {
        continue;
      }

      const result = rule.validator(value, formData);
      if (!result.isValid) {
        return {
          isValid: false,
          error: rule.message || result.error,
        };
      }
    }

    return { isValid: true };
  }, [validationRules]);

  // Validate entire form
  const validateForm = useCallback((formData: T): EnhancedFormValidationResult => {
    console.log('🔍 [ENHANCED-FORM-VALIDATION] Validating entire form:', formData);
    
    const errors: Record<string, string> = {};
    const fieldResults: Record<string, ValidationResult> = {};
    let isValid = true;

    // Validate each field that has rules
    for (const fieldName of Object.keys(validationRules)) {
      const fieldValue = formData[fieldName];
      const result = validateField(fieldName, fieldValue, formData);
      
      fieldResults[fieldName] = result;
      
      if (!result.isValid) {
        isValid = false;
        errors[fieldName] = result.error || 'Invalid field';
        
        if (stopOnFirstError) {
          break;
        }
      }
    }

    const validationResult: EnhancedFormValidationResult = {
      isValid,
      errors,
      firstError: Object.values(errors)[0],
      invalidFields: Object.keys(errors),
    };

    // Update validation state
    setValidationState(prev => ({
      ...prev,
      isValid,
      errors,
      fieldValidationResults: fieldResults,
      hasBeenSubmitted: true,
    }));

    console.log('✅ [ENHANCED-FORM-VALIDATION] Validation result:', validationResult);
    return validationResult;
  }, [validationRules, validateField, stopOnFirstError]);

  // Handle field change with validation
  const handleFieldChange = useCallback((
    fieldName: string, 
    value: any, 
    formData: T
  ) => {
    const shouldValidateOnChange = mode === 'onChange' || validationState.touchedFields.has(fieldName);
    
    if (shouldValidateOnChange) {
      const result = validateField(fieldName, value, formData);
      
      setValidationState(prev => ({
        ...prev,
        errors: result.isValid 
          ? { ...prev.errors, [fieldName]: '' }
          : { ...prev.errors, [fieldName]: result.error || '' },
        fieldValidationResults: {
          ...prev.fieldValidationResults,
          [fieldName]: result,
        },
        touchedFields: new Set([...prev.touchedFields, fieldName]),
      }));
    }
  }, [mode, validateField, validationState.touchedFields]);

  // Handle field blur
  const handleFieldBlur = useCallback((
    fieldName: string, 
    value: any, 
    formData: T
  ) => {
    const shouldValidateOnBlur = mode === 'onBlur' || mode === 'onChange';
    
    if (shouldValidateOnBlur) {
      const result = validateField(fieldName, value, formData);
      
      setValidationState(prev => ({
        ...prev,
        errors: result.isValid 
          ? { ...prev.errors, [fieldName]: '' }
          : { ...prev.errors, [fieldName]: result.error || '' },
        fieldValidationResults: {
          ...prev.fieldValidationResults,
          [fieldName]: result,
        },
        touchedFields: new Set([...prev.touchedFields, fieldName]),
      }));
    }
  }, [mode, validateField]);

  // Get field error
  const getFieldError = useCallback((fieldName: string): string => {
    if (!showErrorsImmediately && !validationState.hasBeenSubmitted && !validationState.touchedFields.has(fieldName)) {
      return '';
    }
    return validationState.errors[fieldName] || '';
  }, [validationState.errors, validationState.hasBeenSubmitted, validationState.touchedFields, showErrorsImmediately]);

  // Check if field is valid
  const isFieldValid = useCallback((fieldName: string): boolean => {
    const result = validationState.fieldValidationResults[fieldName];
    return result ? result.isValid : true;
  }, [validationState.fieldValidationResults]);

  // Reset validation state
  const resetValidation = useCallback(() => {
    setValidationState({
      isValid: false,
      isValidating: false,
      errors: {},
      touchedFields: new Set(),
      hasBeenSubmitted: false,
      fieldValidationResults: {},
    });
  }, []);

  // Clear field error
  const clearFieldError = useCallback((fieldName: string) => {
    setValidationState(prev => ({
      ...prev,
      errors: { ...prev.errors, [fieldName]: '' },
    }));
  }, []);

  // Set custom field error
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setValidationState(prev => ({
      ...prev,
      errors: { ...prev.errors, [fieldName]: error },
      isValid: false,
    }));
  }, []);

  // Computed validation summary
  const validationSummary = useMemo(() => {
    const totalFields = Object.keys(validationRules).length;
    const validFields = Object.values(validationState.fieldValidationResults)
      .filter(result => result.isValid).length;
    const errorCount = Object.values(validationState.errors)
      .filter(error => error.trim() !== '').length;

    return {
      totalFields,
      validFields,
      errorCount,
      completionPercent: totalFields > 0 ? Math.round((validFields / totalFields) * 100) : 0,
    };
  }, [validationRules, validationState.fieldValidationResults, validationState.errors]);

  return {
    // Validation methods
    validateForm,
    validateField,
    handleFieldChange,
    handleFieldBlur,
    
    // Error management
    getFieldError,
    clearFieldError,
    setFieldError,
    
    // State queries
    isFieldValid,
    isFormValid: validationState.isValid,
    isValidating: validationState.isValidating,
    hasErrors: Object.values(validationState.errors).some(error => error.trim() !== ''),
    
    // State management
    resetValidation,
    
    // Validation state
    validationState,
    validationSummary,
    
    // Field helpers
    touchField: (fieldName: string) => {
      setValidationState(prev => ({
        ...prev,
        touchedFields: new Set([...prev.touchedFields, fieldName]),
      }));
    },
    
    isFieldTouched: (fieldName: string) => validationState.touchedFields.has(fieldName),
  };
};

// Predefined validation rule builders for common use cases
export const ValidationRuleBuilders = {
  required: (message = 'This field is required'): ValidationRule => ({
    validator: FormValidators.required,
    message,
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validator: FormValidators.email,
    message,
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    validator: (value: string) => FormValidators.minLength(value, length),
    message: message || `Minimum length is ${length} characters`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    validator: (value: string) => FormValidators.maxLength(value, length),
    message: message || `Maximum length is ${length} characters`,
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    validator: (value: string) => ({
      isValid: regex.test(value),
      error: message,
    }),
    message,
  }),

  custom: (validator: (value: any, formData?: any) => ValidationResult, message?: string): ValidationRule => ({
    validator,
    message,
  }),

  conditional: (
    condition: (formData: any) => boolean,
    rules: ValidationRule[]
  ): ValidationRule[] => 
    rules.map(rule => ({
      ...rule,
      when: condition,
    })),
};

// Common validation configurations for different application types
export const commonValidationConfigs = {
  contractorForm: {
    applicant_name: [ValidationRuleBuilders.required()],
    address: [ValidationRuleBuilders.required()],
    panCardNumber: [
      ValidationRuleBuilders.required(),
      ValidationRuleBuilders.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN card format'),
    ],
    contractorType: [ValidationRuleBuilders.required()],
    currentWorkingVoltage: [ValidationRuleBuilders.required()],
  },

  supervisorForm: {
    fullName: [
      ValidationRuleBuilders.required(),
      ValidationRuleBuilders.minLength(2),
      ValidationRuleBuilders.maxLength(100),
    ],
    address: [ValidationRuleBuilders.required()],
    district: [ValidationRuleBuilders.required()],
    tehsil: [ValidationRuleBuilders.required()],
    licenseNumber: [
      ValidationRuleBuilders.required(),
      ValidationRuleBuilders.minLength(5),
    ],
    dateOfBirth: [ValidationRuleBuilders.required()],
    contactNumber: [
      ValidationRuleBuilders.required(),
      ValidationRuleBuilders.pattern(/^\d{10}$/, 'Contact number must be 10 digits'),
    ],
  },

  wiremanForm: {
    fullName: [
      ValidationRuleBuilders.required(),
      ValidationRuleBuilders.minLength(2),
      ValidationRuleBuilders.maxLength(100),
    ],
    address: [ValidationRuleBuilders.required()],
    district: [ValidationRuleBuilders.required()],
    tehsil: [ValidationRuleBuilders.required()],
    licenseNumber: [
      ValidationRuleBuilders.required(),
      ValidationRuleBuilders.minLength(5),
    ],
    dateOfBirth: [ValidationRuleBuilders.required()],
    contactNumber: [
      ValidationRuleBuilders.required(),
      ValidationRuleBuilders.pattern(/^\d{10}$/, 'Contact number must be 10 digits'),
    ],
  },
};