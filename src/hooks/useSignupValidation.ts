import { useState, useCallback } from 'react';
import type { SignupFormData, SignupFormErrors } from '../types';
import { FormValidators } from '../utils/validators';

export const useSignupValidation = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    username: '',
    password: '',
    confirmPassword: '',
    captchaCode: '',
  });

  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateField = useCallback((name: keyof SignupFormData, value: string, context?: any): string | undefined => {
    switch (name) {
      case 'username':
        const usernameValidation = FormValidators.username(value);
        return usernameValidation.isValid ? undefined : usernameValidation.error;
      
      case 'password':
        const passwordValidation = FormValidators.password(value);
        return passwordValidation.isValid ? undefined : passwordValidation.error;
      
      case 'confirmPassword':
        if (!value.trim()) {
          return 'Confirm password is required';
        }
        if (context?.password && value !== context.password) {
          return 'Passwords do not match';
        }
        return undefined;
      
      case 'captchaCode':
        const captchaValidation = FormValidators.captcha(value);
        return captchaValidation.isValid ? undefined : captchaValidation.error;
      
      default:
        return undefined;
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    setIsSubmitted(true); // Set submitted to true when validation is called
    const newErrors: SignupFormErrors = {};
    let isValid = true;

      // Mark all fields as touched when form is submitted
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    const usernameError = validateField('username', formData.username);
    if (usernameError) {
      newErrors.username = usernameError;
      isValid = false;
    }

    const passwordError = validateField('password', formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
      isValid = false;
    }

    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword, { password: formData.password });
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
      isValid = false;
    }

    const captchaCodeError = validateField('captchaCode', formData.captchaCode);
    if (captchaCodeError) {
      newErrors.captchaCode = captchaCodeError;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const handleFieldChange = useCallback((name: keyof SignupFormData, value: string) => {
    setFormData((prev: SignupFormData) => ({ ...prev, [name]: value }));
    setTouched((prev: Record<string, boolean>) => ({ ...prev, [name]: true }));

     if (isSubmitted && errors[name]) {
      setErrors((prev: SignupFormErrors) => ({ ...prev, [name]: undefined }));
    }
  }, [errors, isSubmitted]);

  const handleFieldBlur = useCallback((name: keyof SignupFormData, context?: any) => {
   
    if (!isSubmitted) return;
    setTouched((prev: Record<string, boolean>) => ({ ...prev, [name]: true }));
    
    const error = validateField(name, formData[name], context);
    setErrors((prev: SignupFormErrors) => ({ ...prev, [name]: error }));
  }, [formData, validateField, isSubmitted]);

  const submitForm = useCallback((): boolean => {
    setIsSubmitted(true);
    
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    return validateForm();
  }, [formData, validateForm]);

  const isFormValid = useCallback((): boolean => {
    return Object.values(formData).every((value: string) => value.trim() !== '') && 
           Object.keys(errors).length === 0;
  }, [formData, errors]);

  const resetForm = useCallback(() => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      captchaCode: '',
    });
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
  }, []);

  return {
    formData,
    errors,
    touched,
    isSubmitted,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    validateField,
    submitForm,
    isFormValid,
    resetForm,
  };
};

export default useSignupValidation;
