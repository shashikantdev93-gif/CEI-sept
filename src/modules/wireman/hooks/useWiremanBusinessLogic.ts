/**
 * Wireman Business Logic Hook
 * Phase 2.4 - Modular Architecture
 * 
 * Manages all business logic for wireman information form
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UseWiremanBusinessLogicReturn, WiremanFormErrors, WiremanApplication } from '../types/WiremanTypes';
import { useProjectSiteAPI } from '../../../hooks/useProjectSiteAPI';
import WiremanApiService from '../services/wiremanApiService';

export const useWiremanBusinessLogic = (): UseWiremanBusinessLogicReturn => {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [panNo, setPanNo] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [hasCertificateFromOtherState, setHasCertificateFromOtherState] = useState<"Yes" | "No">("No");
  
  // Additional State
  const [isLoading, setIsLoading] = useState(false);
  const [isDraftMode, setIsDraftMode] = useState(false);
  const [draftApplicationId, setDraftApplicationId] = useState<number | null>(null);
  const [errors, setErrors] = useState<WiremanFormErrors>({});

  // Draft mode detection logic (Angular parity)
  const getDraftApplicationId = (): number | null => {
    console.log('🔍 [WIREMAN-HOOK] ===== IMMEDIATE DRAFT ID DETECTION =====');
    
    // Step 1: Check localStorage first (Contractor parity)
    const applicationIdFromStorage = localStorage.getItem('ApplicationId');
    const inspectionTypeFromStorage = localStorage.getItem('InspectionType');
    
    console.log('📱 [WIREMAN-HOOK] localStorage check:', {
      ApplicationId: applicationIdFromStorage,
      InspectionType: inspectionTypeFromStorage
    });
    
    if (applicationIdFromStorage && inspectionTypeFromStorage === 'Wireman') {
      const numericAppId = parseInt(applicationIdFromStorage);
      if (!isNaN(numericAppId) && numericAppId > 0) {
        console.log('✅ [WIREMAN-HOOK] Draft navigation detected via localStorage:', numericAppId);
        return numericAppId;
      }
    }
    
    // Step 2: Check sessionStorage as fallback
    const allowDraftNavigation = sessionStorage.getItem('allowDraftNavigation');
    const draftData = sessionStorage.getItem('draftApplicationData');
    
    if (allowDraftNavigation === 'true' && draftData) {
      try {
        const parsedData = JSON.parse(draftData);
        console.log('📊 [WIREMAN-HOOK] Draft data found:', parsedData);
        
        // Only process if it's wireman application type (8)
        if (parsedData.applicationType === 8 && parsedData.appId) {
          console.log('✅ [WIREMAN-HOOK] Wireman draft mode detected, appId:', parsedData.appId);
          return parsedData.appId;
        } else {
          console.log('⚠️ [WIREMAN-HOOK] Draft data is not for wireman application');
        }
      } catch (error) {
        console.error('❌ [WIREMAN-HOOK] Error parsing draft data:', error);
      }
    }
    
    console.log('ℹ️ [WIREMAN-HOOK] No wireman draft detected - creating new application');
    return null;
  };

  // Function to populate form from API data (wireman-specific fields)
  const populateFormFromAPI = (wiremanApplication: WiremanApplication) => {
    console.log('🔧 [WIREMAN-HOOK] Populating wireman-specific fields...');
    
    // Map wireman-specific fields from API response
    if (wiremanApplication.wiremanLicence_GeneralDetails) {
      const wiremanDetails = wiremanApplication.wiremanLicence_GeneralDetails;
      
      if (wiremanDetails.doYouHoldPermit !== undefined) {
        setHasCertificateFromOtherState(wiremanDetails.doYouHoldPermit ? "Yes" : "No");
        console.log('✅ [WIREMAN-HOOK] Wireman permit status auto-filled:', wiremanDetails.doYouHoldPermit);
      }
    }
  };

  // Project Site API integration for loading existing data
  const {
    loadProjectSiteDetails
  } = useProjectSiteAPI({
    pageType: 'applicationForm',
    autoLoad: false, // We'll load manually when needed
    onDataLoaded: (data: any) => {
      console.log('🎯 [WIREMAN-HOOK] Project site data loaded, extracting wireman data...');
      
      if (data && data.applications && draftApplicationId) {
        // Filter applications for wireman type (applicationType: 8) and matching appId
        const wiremanApplication = data.applications.find((app: any) => 
          app.applicationType === 8 && app.appId === draftApplicationId
        );
        
        if (wiremanApplication) {
          console.log('✅ [WIREMAN-HOOK] Found wireman application data:', wiremanApplication);
          populateFormFromAPI(wiremanApplication);
        } else {
          console.warn('⚠️ [WIREMAN-HOOK] No matching wireman application found');
        }
      }
      
      // Extract basic user profile data (always available)
      if (data && data.users && data.users.userProfileMapping && data.users.userProfileMapping.userProfile) {
        const userProfile = data.users.userProfileMapping.userProfile;
        
        // Populate basic fields from user profile (Angular parity)
        if (userProfile.firstName && userProfile.lastName) {
          const fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim();
          setName(fullName);
          console.log('✅ [WIREMAN-HOOK] Name auto-filled:', fullName);
        }
        
        if (userProfile.mobileNo) {
          setMobileNumber(userProfile.mobileNo);
          console.log('✅ [WIREMAN-HOOK] Mobile auto-filled:', userProfile.mobileNo);
        }
        
        if (userProfile.email) {
          setEmail(userProfile.email);
          console.log('✅ [WIREMAN-HOOK] Email auto-filled:', userProfile.email);
        }
        
        if (userProfile.commuAddress1) {
          setAddress(userProfile.commuAddress1);
          console.log('✅ [WIREMAN-HOOK] Address auto-filled:', userProfile.commuAddress1);
        }
      }
      
      // Extract additional profile fields from data.applicantPanNumber and other sources
      if (data && data.applicantPanNumber) {
        setPanNo(data.applicantPanNumber);
        console.log('✅ [WIREMAN-HOOK] PAN auto-filled from projectSiteData:', data.applicantPanNumber);
      }
    },
    onError: (error) => {
      console.error('❌ [WIREMAN-HOOK] Error loading project site data:', error);
    }
  });

  // Navigation handlers
  const handleBack = () => {
    console.log('🔙 [WIREMAN-HOOK] Navigating back...');
    navigate(-1);
  };

  const handleSaveAndNext = () => {
    console.log('💾 [WIREMAN-HOOK] Saving wireman registration and proceeding to next step...');
    
    // Validate form before proceeding
    const formData = {
      name,
      fatherName,
      panNo,
      dateOfBirth,
      address,
      mobileNumber,
      email,
      hasCertificateFromOtherState
    };
    
    const validation = WiremanApiService.validateWiremanForm(formData);
    
    if (!validation.isValid) {
      console.log('❌ [WIREMAN-HOOK] Form validation failed:', validation.errors);
      setErrors(validation.errors);
      return;
    }
    
    // Clear any previous errors
    setErrors({});
    
    // Set navigation flag for next step
    WiremanApiService.setUploadDocumentNavigationFlag();
    console.log('✅ [WIREMAN-HOOK] Set allowUploadWiremanDocumentNavigation flag');
    
    navigate('/dashboard/ProjectDetails/applicationForm/wireman-information-new/upload-wireman-document');
  };

  // Component initialization effect
  useEffect(() => {
    console.log('🔧 [WIREMAN-HOOK] ===== WIREMAN COMPONENT INITIALIZED =====');
    console.log('🔧 [WIREMAN-HOOK] Component mounted');
    console.log('🔧 [WIREMAN-HOOK] Current location: /wireman-information-new');
    
    // Get draft application ID
    const detectedDraftId = getDraftApplicationId();
    setDraftApplicationId(detectedDraftId);
    setIsDraftMode(detectedDraftId !== null);
    
    // Clean up draft navigation flags
    WiremanApiService.cleanupNavigationState();
    
    // Load project site data if in draft mode
    if (detectedDraftId) {
      console.log('🔄 [WIREMAN-HOOK] Draft mode detected, loading project site data...');
      loadProjectSiteDetails();
    } else {
      console.log('ℹ️ [WIREMAN-HOOK] No draft data found - creating new application');
    }
    
    return () => {
      // Cleanup on unmount
      WiremanApiService.cleanupNavigationState();
    };
  }, [loadProjectSiteDetails]);

  return {
    // Form State
    name,
    fatherName,
    panNo,
    dateOfBirth,
    address,
    mobileNumber,
    email,
    hasCertificateFromOtherState,
    isLoading,
    isDraftMode,
    draftApplicationId,
    
    // Form State Setters
    setName,
    setFatherName,
    setPanNo,
    setDateOfBirth,
    setAddress,
    setMobileNumber,
    setEmail,
    setHasCertificateFromOtherState,
    
    // Form Validation
    errors,
    setErrors,
    
    // Business Logic Functions
    handleBack,
    handleSaveAndNext,
    populateFormFromAPI,
    getDraftApplicationId,
    
    // Loading States
    setIsLoading
  };
};