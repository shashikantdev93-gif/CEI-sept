import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProjectSiteAPI } from './useProjectSiteAPI';
import { useApplicationAvailability } from './useApplicationAvailability';

interface ApplicationDetails {
  applicationType: number;
  applicationPurposeType: number;
  applicationLicenceNoMapping?: {
    licenceNumber?: string;
    licenceValidOnUpToDate?: string;
    generatedLicenceNo?: string;
  };
  [key: string]: any;
}

interface ProcessedApplicationData {
  // Core data from Angular
  projectSiteData: any;
  applicationType: number;
  
  // Application arrays (Angular parity)
  contractorApplicationDetails: ApplicationDetails[];
  supervisorApplicationDetails: ApplicationDetails[];
  wiremanApplicationDetails: ApplicationDetails[];
  
  // Application existence flags (Angular parity)
  contractorAppsExist: boolean;
  supervisorAppsExist: boolean;
  wiremanAppsExist: boolean;
  
  // Generated license numbers (Angular parity)
  generatedLicenceNumberContractor: string | null;
  generatedLicenceNumberSupervisor: string | null;
  generatedLicenceNumberWireman: string | null;
  
  // Renewal objects (Angular parity)
  contractorFormRenewObj: ApplicationDetails | null;
  supervisorFormRenewObj: ApplicationDetails | null;
  wiremanFormRenewObj: ApplicationDetails | null;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

interface UseEnhancedApplicationDataOptions {
  autoLoad?: boolean;
  onDataLoaded?: (data: ProcessedApplicationData) => void;
  onError?: (error: string) => void;
}

/**
 * Enhanced hook that provides complete Angular parity for application data processing
 * Combines useProjectSiteAPI and useApplicationAvailability with Angular's data processing logic
 * 
 * This hook replicates Angular's getProjectSitesDetails_ById() method exactly:
 * 1. Loads project site data
 * 2. Filters applications by type (contractor=6, supervisor=7, wireman=8)
 * 3. Extracts generated license numbers
 * 4. Creates renewal objects for each application type
 */
export const useEnhancedApplicationData = (
  options: UseEnhancedApplicationDataOptions = {}
): ProcessedApplicationData => {
  const { autoLoad = true, onDataLoaded, onError } = options;

  // State for processed data
  const [processedData, setProcessedData] = useState<ProcessedApplicationData>({
    projectSiteData: null,
    applicationType: 0,
    contractorApplicationDetails: [],
    supervisorApplicationDetails: [],
    wiremanApplicationDetails: [],
    contractorAppsExist: false,
    supervisorAppsExist: false,
    wiremanAppsExist: false,
    generatedLicenceNumberContractor: null,
    generatedLicenceNumberSupervisor: null,
    generatedLicenceNumberWireman: null,
    contractorFormRenewObj: null,
    supervisorFormRenewObj: null,
    wiremanFormRenewObj: null,
    loading: false,
    error: null
  });

  // Use existing hooks
  const {
    projectSiteData,
    loading: projectSiteLoading,
    error: projectSiteError
  } = useProjectSiteAPI({
    pageType: 'applicationForm',
    autoLoad,
    onError: (error) => {
      console.error('❌ [ENHANCED-APP-DATA] Project site error:', error);
    },
    onDataLoaded: (data) => {
      console.log('✅ [ENHANCED-APP-DATA] Project site data loaded:', data);
    }
  });

  const {
    loading: availabilityLoading,
    error: availabilityError
  } = useApplicationAvailability({
    autoLoad,
    onError: (error) => {
      console.error('❌ [ENHANCED-APP-DATA] Application availability error:', error);
    }
  });

  // Process data when both sources are loaded (Angular parity)
  const processApplicationData = useCallback(() => {
    if (!projectSiteData) {
      console.log('🔄 [ENHANCED-APP-DATA] Project site data not ready yet');
      return;
    }

    console.log('🔄 [ENHANCED-APP-DATA] Processing application data (Angular parity)');

    try {
      // Step 1: Extract application type from project site (Angular logic)
      const applicationType = projectSiteData.projectSiteApplicationType || 0;
      console.log('📊 [ENHANCED-APP-DATA] Application type:', applicationType);

      // Step 2: Get all applications from project site data
      const allApplications = projectSiteData.applications || [];
      console.log('📊 [ENHANCED-APP-DATA] Total applications found:', allApplications.length);

      // Step 3: Filter applications by type (exact Angular logic)
      const contractorApplicationDetails = allApplications.filter((element: any) => element.applicationType === 6);
      const supervisorApplicationDetails = allApplications.filter((element: any) => element.applicationType === 7);
      const wiremanApplicationDetails = allApplications.filter((element: any) => element.applicationType === 8);

      console.log('📊 [ENHANCED-APP-DATA] Filtered applications:', {
        contractor: contractorApplicationDetails.length,
        supervisor: supervisorApplicationDetails.length,
        wireman: wiremanApplicationDetails.length
      });

      // Step 4: Extract generated license numbers (Angular logic)
      let generatedLicenceNumberContractor: string | null = null;
      let generatedLicenceNumberSupervisor: string | null = null;
      let generatedLicenceNumberWireman: string | null = null;

      if (contractorApplicationDetails[0]?.applicationLicenceNoMapping) {
        generatedLicenceNumberContractor = contractorApplicationDetails[0].applicationLicenceNoMapping.licenceNumber || null;
      }
      if (supervisorApplicationDetails[0]?.applicationLicenceNoMapping) {
        generatedLicenceNumberSupervisor = supervisorApplicationDetails[0].applicationLicenceNoMapping.licenceNumber || null;
      }
      if (wiremanApplicationDetails[0]?.applicationLicenceNoMapping) {
        generatedLicenceNumberWireman = wiremanApplicationDetails[0].applicationLicenceNoMapping.licenceNumber || null;
      }

      console.log('📊 [ENHANCED-APP-DATA] Generated license numbers:', {
        contractor: generatedLicenceNumberContractor,
        supervisor: generatedLicenceNumberSupervisor,
        wireman: generatedLicenceNumberWireman
      });

      // Step 5: Create renewal objects (Angular logic)
      // Filter for applicationPurposeType === 2 (renewal) and get the latest one
      const contractorFormRenewObj = contractorApplicationDetails
        .filter((e: any) => e.applicationPurposeType === 2)
        .pop() || null;
      
      const supervisorFormRenewObj = supervisorApplicationDetails
        .filter((e: any) => e.applicationPurposeType === 2)
        .pop() || null;
        
      const wiremanFormRenewObj = wiremanApplicationDetails
        .filter((e: any) => e.applicationPurposeType === 2)
        .pop() || null;

      console.log('📊 [ENHANCED-APP-DATA] Renewal objects created:', {
        contractorRenewal: !!contractorFormRenewObj,
        supervisorRenewal: !!supervisorFormRenewObj,
        wiremanRenewal: !!wiremanFormRenewObj
      });

      // Step 6: Build final processed data
      const newProcessedData: ProcessedApplicationData = {
        projectSiteData,
        applicationType,
        contractorApplicationDetails,
        supervisorApplicationDetails,
        wiremanApplicationDetails,
        contractorAppsExist: contractorApplicationDetails.length > 0,
        supervisorAppsExist: supervisorApplicationDetails.length > 0,
        wiremanAppsExist: wiremanApplicationDetails.length > 0,
        generatedLicenceNumberContractor,
        generatedLicenceNumberSupervisor,
        generatedLicenceNumberWireman,
        contractorFormRenewObj,
        supervisorFormRenewObj,
        wiremanFormRenewObj,
        loading: false,
        error: null
      };

      console.log('✅ [ENHANCED-APP-DATA] Processing complete:', newProcessedData);

      setProcessedData(newProcessedData);

      // Call callback if provided
      if (onDataLoaded) {
        onDataLoaded(newProcessedData);
      }

    } catch (error: any) {
      console.error('❌ [ENHANCED-APP-DATA] Processing error:', error);
      const errorMessage = error?.message || 'Failed to process application data';
      
      setProcessedData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      if (onError) {
        onError(errorMessage);
      }
    }
  }, [projectSiteData, onDataLoaded, onError]);

  // Process data when dependencies change
  useEffect(() => {
    if (projectSiteData && !projectSiteLoading && !availabilityLoading) {
      processApplicationData();
    }
  }, [projectSiteData, projectSiteLoading, availabilityLoading, processApplicationData]);

  // Update loading state
  const isLoading = useMemo(() => {
    return projectSiteLoading || availabilityLoading;
  }, [projectSiteLoading, availabilityLoading]);

  // Update error state
  const combinedError = useMemo(() => {
    return projectSiteError || availabilityError || processedData.error;
  }, [projectSiteError, availabilityError, processedData.error]);

  // Return processed data with current loading/error states
  return {
    ...processedData,
    loading: isLoading,
    error: combinedError
  };
};