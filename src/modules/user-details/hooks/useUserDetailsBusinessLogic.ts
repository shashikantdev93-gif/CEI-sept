/**
 * User Details Business Logic Hook
 * Phase 2.3 - Modular Architecture
 * 
 * Manages all business logic for user details form
 */

import { useState, useEffect } from 'react';
import type { UseUserDetailsBusinessLogicReturn, UserDetailsFormErrors, FileUploadInfo } from '../types/UserDetailsTypes';
import { useLocation } from '../../../hooks/useLocation';
import encryptionService from '../../../lib/encryptionService';
import DateTimeUtils from '../../../utils/dateTimeUtils';
import { useNavigate } from 'react-router-dom';
import { axiosInterceptor } from '../../../lib/interceptor';

export const useUserDetailsBusinessLogic = (): UseUserDetailsBusinessLogicReturn => {
  const navigate = useNavigate();
  
  // Form State
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [faxNo, setFaxNo] = useState("");
  const [email, setEmail] = useState("");
  const [altEmail, setAltEmail] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [villageTown, setVillageTown] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [dob, setDob] = useState("");
  const [state, setState] = useState<string>("3"); // Default to Punjab
  const [district, setDistrict] = useState<number | "">("");
  const [tehsil, setTehsil] = useState<string>("");
  const [photo, setPhoto] = useState("");
  const [signature, setSignature] = useState("");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [isMobileNumberVerified, setIsMobileNumberVerified] = useState(false);
  
  // Form validation errors
  const [errors, setErrors] = useState<UserDetailsFormErrors>({});
  
  // Location hook for dynamic dropdowns
  const {
    districts,
    tehsils,
    loading,
    errors: locationErrors,
    pincodeValidation,
    loadDistricts,
    loadTehsils,
    validatePincode,
    resetTehsils
  } = useLocation();

  // Token initialization effect
  useEffect(() => {
    const initializeToken = () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('⚠️ [USER-DETAILS-HOOK] No token found, creating initial token...');
        
        const initialToken = {
          userId: encryptionService.set('1'), 
          token: encryptionService.set('guest_registration_token'),
          userProfileId: encryptionService.set('0'), 
          projectSiteId: encryptionService.set('0'), 
          roleCode: encryptionService.set('GUEST'),
          userName: encryptionService.set('Guest User')
        };
        
        localStorage.setItem('token', JSON.stringify(initialToken));
        localStorage.setItem('loginTime', encryptionService.set(new Date().toISOString()));
        localStorage.setItem('actionTime', encryptionService.set(new Date().toISOString()));
        
        console.log('✅ [USER-DETAILS-HOOK] Initial token created with ALL encrypted values');
      } else {
        try {
          const parsedToken = JSON.parse(token);
          console.log('✅ [USER-DETAILS-HOOK] Token exists, checking encryption');
          
          if (parsedToken.token && !(parsedToken.token.includes('==') || parsedToken.token.includes('+') || parsedToken.token.includes('/'))) {
            console.log('⚠️ [USER-DETAILS-HOOK] Token value not encrypted, encrypting now...');
            
            const encryptedToken = encryptionService.set(parsedToken.token);
            parsedToken.token = encryptedToken;
            localStorage.setItem('token', JSON.stringify(parsedToken));
          }
          
          if (!localStorage.getItem('loginTime')) {
            localStorage.setItem('loginTime', encryptionService.set(new Date().toISOString()));
          }
          if (!localStorage.getItem('actionTime')) {
            localStorage.setItem('actionTime', encryptionService.set(new Date().toISOString()));
          }
        } catch (e) {
          console.error('❌ [USER-DETAILS-HOOK] Invalid token format:', e);
          
          const newToken = {
            userId: encryptionService.set('1'),
            token: encryptionService.set('guest_registration_token'),
            userProfileId: encryptionService.set('0'),
            projectSiteId: encryptionService.set('0'),
            roleCode: encryptionService.set('GUEST'),
            userName: encryptionService.set('Guest User')
          };
          
          localStorage.setItem('token', JSON.stringify(newToken));
          localStorage.setItem('loginTime', encryptionService.set(new Date().toISOString()));
          localStorage.setItem('actionTime', encryptionService.set(new Date().toISOString()));
        }
      }
    };

    initializeToken();
  }, []);

  // Load districts for Punjab on mount
  useEffect(() => {
    console.log('🏘️ [USER-DETAILS-HOOK] Component mounted, loading districts for Punjab (ID: 3)');
    loadDistricts(3);
  }, [loadDistricts]);

  // File upload handler
  const handleFileUploaded = (info: FileUploadInfo) => {
    console.log('📁 [USER-DETAILS-HOOK] File upload callback:', info);
    const { formControlName, serverResponse } = info;
    
    const fileName = serverResponse.generatedFileNames.replace(/^,/, "");
    const fileUrl = `${import.meta.env.VITE_UPLOAD_URL}Uploads/Documents/TempFiles/${fileName.trim()}`;
    
    console.log('📁 [USER-DETAILS-HOOK] Generated file name:', fileName);
    console.log('📁 [USER-DETAILS-HOOK] Preview URL:', fileUrl);

    if (formControlName === 'profilePhoto') {
      setPhoto(fileName);
      setPhotoPreviewUrl(fileUrl);
    } else {
      setSignature(fileName);
      setSignaturePreviewUrl(fileUrl);
    }
  };

  // District change handler
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = Number(e.target.value);
    console.log('🏘️ [USER-DETAILS-HOOK] District changed:', districtCode);
    
    setDistrict(districtCode);
    setTehsil("");
    resetTehsils();

    if (districtCode) {
      console.log('🏘️ [USER-DETAILS-HOOK] Loading tehsils for district:', districtCode);
      loadTehsils(districtCode);
    } else {
      console.log('🏘️ [USER-DETAILS-HOOK] District cleared or invalid, not loading tehsils');
    }
  };

  // Pincode change handler with validation
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setPinCode(value);
      
      if (value.length === 6) {
        validatePincode(value);
      }
    }
  };

  // Get client ID helper function
  const getClientId = async () => {
    console.log('🔍 [USER-DETAILS-HOOK] Getting client ID...');
    
    try {
      console.log('🌐 [GET-CLIENT-ID] Making request to: /CommonApis/getClientId');
      
      const response = await axiosInterceptor.get('/CommonApis/getClientId');
      
      console.log('🌐 [GET-CLIENT-ID] Response status: success');

      const clientId = response.data as string;
      console.log('✅ [USER-DETAILS-HOOK] Client ID received:', clientId);
      
      localStorage.setItem('clientId', clientId);
      console.log('💾 [USER-DETAILS-HOOK] Client ID stored in localStorage');
      
      return clientId;
    } catch (error) {
      console.error('❌ [USER-DETAILS-HOOK] Failed to get client ID:', error);
      throw error;
    }
  };

  // Verify mobile number and generate OTP
  const verifyMobileNumber = async () => {
    console.log('🔄 [OTP-GEN] Starting OTP generation process');
    
    try {
      const token = JSON.parse(localStorage.getItem('token') || '{}');
      console.log('🔑 [OTP-GEN] Token found:', !!token);

      if (!token.userId) {
        throw new Error('No userId found in token');
      }

      const userId = encryptionService.get(token.userId);
      console.log('👤 [OTP-GEN] Decrypted userId:', userId);

      const payload = {
        mobileNumber: mobileNo,
        userId: parseInt(userId)
      };
      
      console.log('📦 [OTP-GEN] Preparing payload:', payload);

      const response = await axiosInterceptor.post<any>(
        '/ProjectSites/generateOtp',
        payload
      );

      console.log('📦 [OTP-GEN] Raw response:', response);

      if (response.success && response.data?.data) {
        console.log('🔐 [OTP-GEN] Encrypted data received:', response.data.data);
        
        const decryptedData = encryptionService.get(response.data.data);
        console.log('🔓 [OTP-GEN] Decrypted data:', decryptedData);

        try {
          const parsedData = JSON.parse(decryptedData);
          console.log('✅ [OTP-GEN] Parsed data:', parsedData);

          if (parsedData.success) {
            console.log('🎉 [OTP-GEN] OTP generated successfully');
            setGeneratedOTP(parsedData.result);
            setShowOTPModal(true);
          } else {
            console.log('❌ [OTP-GEN] Server indicated failure:', parsedData);
            alert(parsedData.message || 'Failed to generate OTP');
          }
        } catch (parseError) {
          console.log('🔑 [OTP-GEN] Using decrypted data directly as OTP');
          setGeneratedOTP(decryptedData);
          setShowOTPModal(true);
        }
      } else {
        console.log('❌ [OTP-GEN] Invalid response structure:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ [OTP-GEN] Error:', error);
      alert(`Failed to send OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save user details
  const save = async () => {
    try {
      console.log('💾 [SAVE] Starting user details submission');
      setIsSubmitting(true);

      // Get client IP from stored clientId
      let clientIP = "::1"; // default
      try {
        const clientIdData = localStorage.getItem('clientId');
        if (clientIdData) {
          const parsed = JSON.parse(clientIdData);
          clientIP = parsed.ip || clientIP;
        }
      } catch (e) {
        console.log('📱 [SAVE] Using default client IP');
      }

      const formData = {
        firstName,
        middleName: middleName || '',
        lastName,
        fatherName,
        mobileNo,
        faxNo: faxNo || '',
        email,
        alternateEmail: altEmail || '',
        dateofbirth: DateTimeUtils.convertLocalDateToUtc(dob),
        profilePhoto: photo,
        signature,
        commuAddress1: address1,
        commuAddress2: address2 || '',
        commuVillageOrTown: villageTown || '',
        commuState: parseInt(state),
        commuDistrictRefId: parseInt(district.toString()),
        commuTehsilRefId: parseInt(tehsil),
        commuPinCode: parseInt(pinCode),
        applicationCategoryUserType: 1,
        isActive: true,
        isDelete: false,
        createdOnDate: DateTimeUtils.getCurrentUtcIsoString(),
        lastModifiedOnDate: DateTimeUtils.getCurrentUtcIsoString(),
        userRefId: parseInt(encryptionService.get(JSON.parse(localStorage.getItem('token') || '{}').userId)),
        clientIPAddress: clientIP
      };

      const pgFormattedData = DateTimeUtils.formatFormDataForPostgreSQL(formData);

      console.log('📦 [SAVE] Form data prepared (unwrapped):', pgFormattedData);

      const response = await axiosInterceptor.post<any>(
        '/UserDetails/addUpdate_UserDetails',
        pgFormattedData
      );

      if (response.success) {
        if (response.data?.applicationInitiateResponse?.userProfileId) {
          const updatedToken = JSON.parse(localStorage.getItem('token') || '{}');
          updatedToken.userProfileId = encryptionService.set(
            response.data.applicationInitiateResponse.userProfileId.toString()
          );
          localStorage.setItem('token', JSON.stringify(updatedToken));
        }

        console.log('✅ [SAVE] User details saved successfully');
        navigate('/dashboard/caf/projectSite');
      } else {
        throw new Error(response.error || 'Failed to save user details');
      }
    } catch (error) {
      console.error('❌ [SAVE] Error:', error);
      alert(`Failed to save user details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP verification success
  const handleOTPVerified = async () => {
    console.log('🪟 [USER-DETAILS-HOOK] OTP verified, processing...');
    console.log('✅ [USER-DETAILS-HOOK] Mobile verification successful, calling getClientId then save()...');
    
    setShowOTPModal(false);
    setIsMobileNumberVerified(true);
    
    try {
      console.log('🔍 [USER-DETAILS-HOOK] Step 1: Getting client ID before save...');
      await getClientId();
      console.log('🔑 [USER-DETAILS-HOOK] Step 2: Got client ID, proceeding with save...');
      
      await save();
    } catch (error) {
      console.error('❌ [USER-DETAILS-HOOK] Failed in handleOTPVerified:', error);
      alert('Failed to process verification. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔥 [USER-DETAILS-HOOK] === SUBMIT BUTTON CLICKED ===');
    console.log('🔥 [USER-DETAILS-HOOK] Timestamp:', new Date().toISOString());

    const newErrors: UserDetailsFormErrors = {};

    // Form validation
    if (!firstName.trim()) newErrors.firstName = "First Name is required";
    if (!lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!fatherName.trim()) newErrors.fatherName = "Father's Name is required";
    if (!mobileNo.trim()) newErrors.mobileNo = "Mobile No is required";
    if (!email.trim()) newErrors.email = "Email Address is required";
    if (!address1.trim()) newErrors.address1 = "Communication Address Line1 is required";
    if (!dob) newErrors.dob = "Date of Birth is required";
    if (!state) newErrors.state = "State is required";
    if (!district) newErrors.district = "District is required";
    if (!tehsil) newErrors.tehsil = "Tehsil is required";
    if (!photo) newErrors.photo = "Photo is required";
    if (!signature) newErrors.signature = "Signature is required";
    
    // Pincode validation
    if (!pinCode.trim()) {
      newErrors.pinCode = "Pincode is required";
    } else if (!pincodeValidation.isValid) {
      newErrors.pinCode = pincodeValidation.error || "Invalid pincode";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      console.log('❌ [USER-DETAILS-HOOK] Form is invalid, stopping execution');
      console.log('❌ [USER-DETAILS-HOOK] Form errors:', newErrors);
      return;
    }
    
    console.log('✅ [USER-DETAILS-HOOK] Form validation passed');
    console.log('📋 [USER-DETAILS-HOOK] Form values:', {
      firstName, lastName, fatherName, mobileNo, email, address1, dob, state, district, tehsil
    });
    
    await verifyMobileNumber();
  };

  return {
    // Form State
    firstName,
    middleName,
    lastName,
    fatherName,
    mobileNo,
    faxNo,
    email,
    altEmail,
    address1,
    address2,
    villageTown,
    pinCode,
    dob,
    state,
    district,
    tehsil,
    photo,
    signature,
    photoPreviewUrl,
    signaturePreviewUrl,
    isSubmitting,
    showOTPModal,
    generatedOTP,
    isMobileNumberVerified,
    
    // Form State Setters
    setFirstName,
    setMiddleName,
    setLastName,
    setFatherName,
    setMobileNo,
    setFaxNo,
    setEmail,
    setAltEmail,
    setAddress1,
    setAddress2,
    setVillageTown,
    setPinCode,
    setDob,
    setState,
    setDistrict,
    setTehsil,
    setPhoto,
    setSignature,
    setPhotoPreviewUrl,
    setSignaturePreviewUrl,
    setShowOTPModal,
    setGeneratedOTP,
    setIsMobileNumberVerified,
    
    // Form Validation
    errors,
    setErrors,
    
    // Business Logic Functions
    handleSubmit,
    handleFileUploaded,
    handleDistrictChange,
    handlePincodeChange,
    handleOTPVerified,
    
    // Location data from useLocation hook
    districts,
    tehsils,
    loading: loading.districts || loading.tehsils || loading.pincode,
    locationErrors,
    pincodeValidation
  };
};