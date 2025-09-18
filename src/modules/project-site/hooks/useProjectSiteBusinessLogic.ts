/**
 * Project Site Business Logic Hook
 * Phase 2.5 - Modular Architecture
 * 
 * Manages all business logic for project site form
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { 
  UseProjectSiteBusinessLogicReturn, 
  ProjectSiteFormErrors, 
  FileUploadInfo,
  ProjectSiteFormData
} from '../types/ProjectSiteTypes';
import { DEFAULT_PROJECT_SITE_FORM, DEFAULT_PROJECT_SITE_ERRORS, PROJECT_SITE_VALIDATION } from '../types/ProjectSiteTypes';
import { useLocation } from '../../../hooks/useLocation';
import projectSiteApiService from '../services/projectSiteApiService';

export const useProjectSiteBusinessLogic = (): UseProjectSiteBusinessLogicReturn => {
  const navigate = useNavigate();

  // Form State
  const [projectSiteApplicationType, setProjectSiteApplicationType] = useState(DEFAULT_PROJECT_SITE_FORM.projectSiteApplicationType);
  const [applicantPanNumber, setApplicantPanNumber] = useState(DEFAULT_PROJECT_SITE_FORM.applicantPanNumber);
  const [applicantPanAttachment, setApplicantPanAttachment] = useState(DEFAULT_PROJECT_SITE_FORM.applicantPanAttachment);
  const [address1, setAddress1] = useState(DEFAULT_PROJECT_SITE_FORM.address1);
  const [address2, setAddress2] = useState(DEFAULT_PROJECT_SITE_FORM.address2);
  const [villageOrTown, setVillageOrTown] = useState(DEFAULT_PROJECT_SITE_FORM.villageOrTown);
  const [pinCode, setPinCode] = useState(DEFAULT_PROJECT_SITE_FORM.pinCode);
  const [state, setState] = useState(DEFAULT_PROJECT_SITE_FORM.state);
  const [district, setDistrict] = useState(DEFAULT_PROJECT_SITE_FORM.district);
  const [tehsil, setTehsil] = useState(DEFAULT_PROJECT_SITE_FORM.tehsil);
  const [isSubmitting, setIsSubmitting] = useState(DEFAULT_PROJECT_SITE_FORM.isSubmitting);
  const [panPreviewUrl, setPanPreviewUrl] = useState(DEFAULT_PROJECT_SITE_FORM.panPreviewUrl);

  // Form validation errors
  const [errors, setErrors] = useState<ProjectSiteFormErrors>(DEFAULT_PROJECT_SITE_ERRORS);

  // Location hook for dynamic dropdowns
  const {
    districts,
    tehsils,
    loading: locationLoading,
    errors: locationErrors,
    pincodeValidation,
    loadDistricts,
    loadTehsils,
    validatePincode,
    resetTehsils
  } = useLocation();

  // Initialize districts for Punjab on mount
  useEffect(() => {
    console.log('🏢 [PROJECT-SITE-HOOK] Component mounted, loading districts for Punjab (ID: 3)');
    loadDistricts(3);
  }, [loadDistricts]);

  /**
   * Handle file upload completion
   */
  const handleFileUploaded = (info: FileUploadInfo) => {
    console.log('📁 [PROJECT-SITE-HOOK] File upload callback:', info);
    const { formControlName, serverResponse } = info;
    
    const fileName = serverResponse.generatedFileNames.replace(/^,/, "");
    const fileUrl = `${import.meta.env.VITE_UPLOAD_URL}Uploads/Documents/TempFiles/${fileName.trim()}`;
    
    console.log('📁 [PROJECT-SITE-HOOK] Generated file name:', fileName);
    console.log('📁 [PROJECT-SITE-HOOK] Preview URL:', fileUrl);

    if (formControlName === 'panAttachment') {
      setApplicantPanAttachment(fileName);
      setPanPreviewUrl(fileUrl);
      console.log('📁 [PROJECT-SITE-HOOK] PAN attachment updated:', fileName);
    }
  };

  /**
   * Handle district change
   */
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = Number(e.target.value);
    console.log('🏢 [PROJECT-SITE-HOOK] District changed:', districtCode);
    
    setDistrict(districtCode);
    setTehsil("");
    resetTehsils();

    if (districtCode) {
      console.log('🏢 [PROJECT-SITE-HOOK] Loading tehsils for district:', districtCode);
      loadTehsils(districtCode);
    } else {
      console.log('🏢 [PROJECT-SITE-HOOK] District cleared or invalid, not loading tehsils');
    }
  };

  /**
   * Handle pincode change with validation
   */
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow digits and limit to 6 characters
    if (/^\d{0,6}$/.test(value)) {
      setPinCode(value);
      
      // Validate pincode if 6 digits
      if (value.length === 6) {
        console.log('📍 [PROJECT-SITE-HOOK] Validating pincode:', value);
        validatePincode(value);
      }
    }
  };

  /**
   * Handle PAN number change
   */
  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setApplicantPanNumber(value);
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    console.log('🔍 [PROJECT-SITE-HOOK] Starting form validation');
    
    const newErrors: ProjectSiteFormErrors = {};

    // Basic validation
    if (!projectSiteApplicationType.trim()) {
      newErrors.projectSiteApplicationType = "Application Type is required";
    }
    
    if (!applicantPanNumber.trim()) {
      newErrors.applicantPanNumber = "PAN Number is required";
    }
    
    if (!applicantPanAttachment.trim()) {
      newErrors.applicantPanAttachment = "PAN Attachment is required";
    }
    
    if (!address1.trim()) {
      newErrors.address1 = "Address Line 1 is required";
    }
    
    if (!state) {
      newErrors.state = "State is required";
    }
    
    if (!district) {
      newErrors.district = "District is required";
    }
    
    if (!tehsil) {
      newErrors.tehsil = "Tehsil is required";
    }
    
    // PAN validation
    if (applicantPanNumber && !PROJECT_SITE_VALIDATION.PAN_REGEX.test(applicantPanNumber)) {
      newErrors.applicantPanNumber = "Invalid PAN format (e.g., ABCDE1234F)";
    }
    
    // Pincode validation
    if (!pinCode.trim()) {
      newErrors.pinCode = "Pincode is required";
    } else if (!pincodeValidation.isValid) {
      newErrors.pinCode = pincodeValidation.error || "Invalid pincode";
    }
    
    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    console.log('🔍 [PROJECT-SITE-HOOK] Validation result:', { isValid, errors: newErrors });
    
    return isValid;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🏢 [PROJECT-SITE-HOOK] === FORM SUBMISSION STARTED ===');
    setIsSubmitting(true);

    try {
      // Validate form
      if (!validateForm()) {
        console.log('❌ [PROJECT-SITE-HOOK] Form validation failed');
        return;
      }

      console.log('✅ [PROJECT-SITE-HOOK] Form validation passed, proceeding with submission');

      // Prepare form data
      const formData: ProjectSiteFormData = {
        projectSiteApplicationType,
        applicantPanNumber,
        applicantPanAttachment,
        address1,
        address2,
        villageOrTown,
        pinCode,
        state,
        district,
        tehsil,
        panPreviewUrl,
        isSubmitting: false
      };

      // Submit via API service
      const result = await projectSiteApiService.completeSubmission(formData);

      if (result.success) {
        console.log('✅ [PROJECT-SITE-HOOK] Submission successful');
        console.log('✅ [PROJECT-SITE-HOOK] Project Site ID:', result.projectSiteId);
        
        // Navigate to dashboard after short delay to ensure token update
        setTimeout(() => {
          console.log('✅ [PROJECT-SITE-HOOK] Navigating to dashboard...');
          navigate('/dashboard');
        }, 100);
        
      } else {
        console.error('❌ [PROJECT-SITE-HOOK] Submission failed:', result.error);
        alert(result.error || 'Failed to save project site details');
      }

    } catch (error) {
      console.error('❌ [PROJECT-SITE-HOOK] Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
      
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Get current form data
   */
  const getCurrentFormData = (): ProjectSiteFormData => ({
    projectSiteApplicationType,
    applicantPanNumber,
    applicantPanAttachment,
    address1,
    address2,
    villageOrTown,
    pinCode,
    state,
    district,
    tehsil,
    panPreviewUrl,
    isSubmitting
  });

  /**
   * Reset form to default state
   */
  const resetForm = () => {
    console.log('🔄 [PROJECT-SITE-HOOK] Resetting form to default state');
    
    setProjectSiteApplicationType(DEFAULT_PROJECT_SITE_FORM.projectSiteApplicationType);
    setApplicantPanNumber(DEFAULT_PROJECT_SITE_FORM.applicantPanNumber);
    setApplicantPanAttachment(DEFAULT_PROJECT_SITE_FORM.applicantPanAttachment);
    setAddress1(DEFAULT_PROJECT_SITE_FORM.address1);
    setAddress2(DEFAULT_PROJECT_SITE_FORM.address2);
    setVillageOrTown(DEFAULT_PROJECT_SITE_FORM.villageOrTown);
    setPinCode(DEFAULT_PROJECT_SITE_FORM.pinCode);
    setState(DEFAULT_PROJECT_SITE_FORM.state);
    setDistrict(DEFAULT_PROJECT_SITE_FORM.district);
    setTehsil(DEFAULT_PROJECT_SITE_FORM.tehsil);
    setPanPreviewUrl(DEFAULT_PROJECT_SITE_FORM.panPreviewUrl);
    setIsSubmitting(DEFAULT_PROJECT_SITE_FORM.isSubmitting);
    setErrors(DEFAULT_PROJECT_SITE_ERRORS);
  };

  /**
   * Initialize component
   */
  useEffect(() => {
    console.log('🏢 [PROJECT-SITE-HOOK] === PROJECT SITE HOOK INITIALIZED ===');
    console.log('🏢 [PROJECT-SITE-HOOK] Hook mounted for common-application-form-established');
    
    // Cleanup function
    return () => {
      console.log('🏢 [PROJECT-SITE-HOOK] Hook unmounting');
    };
  }, []);

  return {
    // Form State
    projectSiteApplicationType,
    applicantPanNumber,
    applicantPanAttachment,
    address1,
    address2,
    villageOrTown,
    pinCode,
    state,
    district,
    tehsil,
    isSubmitting,
    panPreviewUrl,
    
    // Form State Setters
    setProjectSiteApplicationType,
    setApplicantPanNumber,
    setApplicantPanAttachment,
    setAddress1,
    setAddress2,
    setVillageOrTown,
    setPinCode,
    setState,
    setDistrict,
    setTehsil,
    setPanPreviewUrl,
    
    // Form Validation
    errors,
    setErrors,
    
    // Location Management
    districts: districts as any,
    tehsils: tehsils as any,
    locationLoading: locationLoading.districts || locationLoading.tehsils || locationLoading.pincode,
    locationErrors,
    pincodeValidation,
    
    // Business Logic Functions
    handleSubmit,
    handleFileUploaded,
    handleDistrictChange,
    handlePincodeChange,
    handlePanChange,
    
    // Loading States
    setIsSubmitting,
    
    // Additional Utility Functions
    getCurrentFormData,
    resetForm,
    validateForm
  };
};