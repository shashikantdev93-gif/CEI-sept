
import { useState, useCallback } from 'react';
import type { FormData } from '../types';
import type { FormErrors } from '../types';
import { FormValidators } from '../utils/validators';

export const useFormValidation = () => {
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    password: '',
    captchaCode: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateField = useCallback((name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'userName':
        const usernameValidation = FormValidators.username(value);
        return usernameValidation.isValid ? undefined : usernameValidation.error;
      
      case 'password':
        const passwordValidation = FormValidators.password(value);
        return passwordValidation.isValid ? undefined : passwordValidation.error;
      
      case 'captchaCode':
        const captchaValidation = FormValidators.captcha(value);
        return captchaValidation.isValid ? undefined : captchaValidation.error;
      
      default:
        return undefined;
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    setIsSubmitted(true);
    const newErrors: FormErrors = {};
    let isValid = true;

    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof FormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const handleFieldChange = useCallback((name: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (isSubmitted && errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }, [errors, isSubmitted]);
  

  const handleFieldBlur = useCallback((name: keyof FormData) => {
    
    if (!isSubmitted) return;

    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, formData[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, [formData, validateField]);

  const resetForm = useCallback(() => {
    setFormData({
      userName: '',
      password: '',
      captchaCode: '',
    });
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
  }, []);

  const submitForm = useCallback(() => {
    setIsSubmitted(true);
    return validateForm();
  }, [validateForm]);

  return {
    formData,
    errors,
    touched,
    isSubmitted,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    submitForm,
    resetForm,
  };
};
