import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { AppStorageService } from '../lib/storage';

// Draft detection configuration for different application types
export interface DraftDetectionConfig {
  applicationType: 'contractor' | 'supervisor' | 'wireman' | 'general';
  expectedInspectionType?: string;
  expectedApplicationTypeId?: number;
  enableUrlParameters?: boolean;
  enableSessionStorage?: boolean;
  enableLocalStorage?: boolean;
  debugPrefix?: string;
}

// Result of draft detection
export interface DraftDetectionResult {
  hasDraft: boolean;
  draftId: number | null;
  draftData: any | null;
  source: 'localStorage' | 'urlParams' | 'sessionStorage' | 'none';
  isNewApplication: boolean;
}

// Hook for centralized draft detection logic
export const useDraftDetection = (config: DraftDetectionConfig): DraftDetectionResult => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const storageService = new AppStorageService();
  const [draftResult, setDraftResult] = useState<DraftDetectionResult>({
    hasDraft: false,
    draftId: null,
    draftData: null,
    source: 'none',
    isNewApplication: true,
  });

  const debugPrefix = config.debugPrefix || `[${config.applicationType.toUpperCase()}-DRAFT]`;

  // Main draft detection function
  const detectDraft = useCallback((): DraftDetectionResult => {
    console.log(`🔍 ${debugPrefix} ===== CENTRALIZED DRAFT DETECTION START =====`);

    // Step 1: Check localStorage first (primary Angular method)
    if (config.enableLocalStorage !== false) {
      const applicationIdFromStorage = storageService.getApplicationId();
      const inspectionTypeFromStorage = storageService.getInspectionType();

      console.log(`📱 ${debugPrefix} localStorage check:`, {
        ApplicationId: applicationIdFromStorage,
        InspectionType: inspectionTypeFromStorage,
        expectedType: config.expectedInspectionType,
      });

      if (applicationIdFromStorage && config.expectedInspectionType) {
        const expectedType = config.expectedInspectionType;
        if (inspectionTypeFromStorage === expectedType) {
          const numericAppId = parseInt(applicationIdFromStorage);
          if (!isNaN(numericAppId) && numericAppId > 0) {
            console.log(`✅ ${debugPrefix} Draft navigation detected via localStorage:`, numericAppId);
            return {
              hasDraft: true,
              draftId: numericAppId,
              draftData: { applicationId: numericAppId, inspectionType: inspectionTypeFromStorage },
              source: 'localStorage',
              isNewApplication: false,
            };
          }
        }
      }
    }

    // Step 2: Check URL parameters as fallback
    if (config.enableUrlParameters !== false) {
      // Check both URLSearchParams and React Router params
      const urlParams = new URLSearchParams(location.search);
      const appRefIdFromUrl = searchParams.get('appRefId') || 
                             searchParams.get('applicationId') || 
                             searchParams.get('appId') ||
                             searchParams.get('ApplicationId') ||
                             urlParams.get('appRefId') ||
                             urlParams.get('applicationId') ||
                             urlParams.get('appId') ||
                             urlParams.get('ApplicationId');

      console.log(`🔗 ${debugPrefix} URL parameter check:`, {
        searchParamsAppRefId: searchParams.get('appRefId'),
        searchParamsApplicationId: searchParams.get('applicationId'),
        searchParamsAppId: searchParams.get('appId'),
        urlParamsAppRefId: urlParams.get('appRefId'),
        urlParamsApplicationId: urlParams.get('applicationId'),
        urlParamsAppId: urlParams.get('appId'),
        finalValue: appRefIdFromUrl,
      });

      if (appRefIdFromUrl) {
        const numericAppRefId = parseInt(appRefIdFromUrl);
        if (!isNaN(numericAppRefId) && numericAppRefId > 0) {
          console.log(`✅ ${debugPrefix} AppRefId found in URL parameters:`, numericAppRefId);
          return {
            hasDraft: true,
            draftId: numericAppRefId,
            draftData: { applicationId: numericAppRefId, source: 'url' },
            source: 'urlParams',
            isNewApplication: false,
          };
        }
      }
    }

    // Step 3: Check sessionStorage as final fallback
    if (config.enableSessionStorage !== false) {
      const allowDraftNavigation = sessionStorage.getItem('allowDraftNavigation');
      const draftData = sessionStorage.getItem('draftApplicationData');

      console.log(`💾 ${debugPrefix} sessionStorage check:`, {
        allowDraftNavigation: allowDraftNavigation,
        hasDraftData: !!draftData,
        expectedApplicationTypeId: config.expectedApplicationTypeId,
      });

      if (allowDraftNavigation === 'true' && draftData) {
        try {
          const parsedData = JSON.parse(draftData);
          console.log(`📊 ${debugPrefix} Draft data parsed:`, parsedData);

          // Check if application type matches if specified
          let isCorrectType = true;
          if (config.expectedApplicationTypeId) {
            isCorrectType = parsedData.applicationType === config.expectedApplicationTypeId;
          }

          if (isCorrectType && (parsedData.appId || parsedData.ApplicationId)) {
            const appId = parsedData.appId || parsedData.ApplicationId;
            console.log(`✅ ${debugPrefix} Draft mode detected via sessionStorage, appId:`, appId);
            return {
              hasDraft: true,
              draftId: appId,
              draftData: parsedData,
              source: 'sessionStorage',
              isNewApplication: false,
            };
          }
        } catch (error) {
          console.error(`❌ ${debugPrefix} Error parsing draft data:`, error);
        }
      }
    }

    console.log(`ℹ️ ${debugPrefix} No draft detected - user creating new application`);
    return {
      hasDraft: false,
      draftId: null,
      draftData: null,
      source: 'none',
      isNewApplication: true,
    };
  }, [config, searchParams, location.search, debugPrefix]);

  // Run detection on mount and when dependencies change
  useEffect(() => {
    const result = detectDraft();
    setDraftResult(result);
  }, [detectDraft]);

  return draftResult;
};

// Predefined configurations for different application types
export const draftConfigs = {
  contractor: {
    applicationType: 'contractor' as const,
    expectedInspectionType: 'Contractor',
    expectedApplicationTypeId: undefined, // Contractor doesn't use this
    debugPrefix: '[CONTRACTOR-DRAFT]',
  },
  supervisor: {
    applicationType: 'supervisor' as const,
    expectedInspectionType: 'Supervisor',
    expectedApplicationTypeId: 7,
    debugPrefix: '[SUPERVISOR-DRAFT]',
  },
  wireman: {
    applicationType: 'wireman' as const,
    expectedInspectionType: 'Wireman',
    expectedApplicationTypeId: undefined, // Add if Wireman has specific type ID
    debugPrefix: '[WIREMAN-DRAFT]',
  },
  general: {
    applicationType: 'general' as const,
    expectedInspectionType: undefined,
    expectedApplicationTypeId: undefined,
    debugPrefix: '[GENERAL-DRAFT]',
  },
} as const;

// Convenience hooks for specific application types
export const useContractorDraftDetection = () => {
  return useDraftDetection(draftConfigs.contractor);
};

export const useSupervisorDraftDetection = () => {
  return useDraftDetection(draftConfigs.supervisor);
};

export const useWiremanDraftDetection = () => {
  return useDraftDetection(draftConfigs.wireman);
};

// Draft management utilities
export const draftUtils = {
  // Clear all draft-related storage
  clearAllDraftData: (): void => {
    console.log('🧹 [DRAFT-UTILS] Clearing all draft data');
    localStorage.removeItem('ApplicationId');
    localStorage.removeItem('InspectionType');
    sessionStorage.removeItem('allowDraftNavigation');
    sessionStorage.removeItem('draftApplicationData');
    
    // Clear any application-specific draft data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('draft_') || key.endsWith('_draft')) {
        localStorage.removeItem(key);
      }
    });
  },

  // Set draft data for specific application type
  setDraftData: (
    applicationId: number, 
    applicationType: string, 
    additionalData?: any
  ): void => {
    console.log('💾 [DRAFT-UTILS] Setting draft data:', {
      applicationId,
      applicationType,
      additionalData,
    });
    
    localStorage.setItem('ApplicationId', applicationId.toString());
    localStorage.setItem('InspectionType', applicationType);
    
    if (additionalData) {
      sessionStorage.setItem('allowDraftNavigation', 'true');
      sessionStorage.setItem('draftApplicationData', JSON.stringify({
        appId: applicationId,
        applicationType: additionalData.applicationTypeId || null,
        ...additionalData,
      }));
    }
  },

  // Check if current session allows draft navigation
  isDraftNavigationAllowed: (): boolean => {
    return sessionStorage.getItem('allowDraftNavigation') === 'true';
  },

  // Get stored draft data without full detection logic
  getStoredDraftData: (): any | null => {
    try {
      const draftData = sessionStorage.getItem('draftApplicationData');
      return draftData ? JSON.parse(draftData) : null;
    } catch (error) {
      console.error('❌ [DRAFT-UTILS] Error parsing stored draft data:', error);
      return null;
    }
  },
};