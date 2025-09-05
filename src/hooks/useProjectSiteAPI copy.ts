import { useState, useEffect, useCallback, useRef } from 'react';
import { axiosInterceptor } from '../lib/interceptor';
import { ToastService } from '../utils';
import encryptionService from '../lib/encryptionService';
import { userDetailsService } from '../services/api/userDetailsService';
import type { ContractorApplicationPayload, SavedContractorData } from '../services/api/userDetailsService';
import { ProjectSiteDataMapper } from '../utils/projectSiteDataMapper';

interface ProjectSiteData {
  projectSiteId?: number;
  projectSiteApplicationType?: number;
  state?: number;
  villageOrTown?: string;
  address1?: string;
  address2?: string;
  tehsilRefId?: number;
  districtRefId?: number;
  pinCode?: number;
  createdOnDate?: string;
  lastModifiedOnDate?: string;
  applicantPanNumber?: string;
  userRefId?: number;
  users?: {
    userId?: number;
    userName?: string;
    userProfileMapping?: {
      userProfile?: {
        firstName?: string;
        lastName?: string;
        mobileNo?: string;
        email?: string;
        commuAddress1?: string;
        commuAddress2?: string;
      }
    }
  };
  applications?: any[];
}

interface ProjectSiteAPIResponse {
  formModel?: ProjectSiteData;
  combinedAgendaModel?: any;
  isEditAllowed?: boolean;
  isLocked?: boolean;
  hasError?: boolean;
  errorDesc?: string;
  applicationLifeCycleStatusType?: number;
}

interface DashboardCounts {
  projectSiteApplied: number;
  rejected: number;
  inbox: number;
  closed: number;
}

interface UseProjectSiteAPIOptions {
  pageType: 'dashboard' | 'projectDetails' | 'applicationForm' | 'contractorApplication';
  autoLoad?: boolean;
  enableCounts?: boolean;
  onDataLoaded?: (data: ProjectSiteData) => void;
  onError?: (error: string) => void;
  // Add contractor-specific callbacks
  onContractorSaveSuccess?: (data: any) => void;
  onContractorSaveError?: (error: string) => void;
  autoFillContractorForm?: boolean;
  onApplicantDataExtracted?: (data: { name: string; address: string; pan: string }) => void;
}


export const useProjectSiteAPI = (options: UseProjectSiteAPIOptions) => {
  const { pageType, autoLoad = true, enableCounts = false } = options;
  
  const [projectSiteData, setProjectSiteData] = useState<ProjectSiteData | null>(null);
  const [dashboardCounts, setDashboardCounts] = useState<DashboardCounts>({
    projectSiteApplied: 1,
    rejected: 0,
    inbox: 0,
    closed: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contractorData, setContractorData] = useState<SavedContractorData | null>(null);
  const [contractorSaving, setContractorSaving] = useState(false);
  const [contractorError, setContractorError] = useState<string | null>(null);

  
  // Use ref to prevent infinite loops
  const hasLoadedRef = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const extractApplicantData = useCallback((projectSiteResponse: any) => {
    if (!projectSiteResponse) return null;

    const extractedData = {
      name: ProjectSiteDataMapper.getApplicantNameFromProjectSite(projectSiteResponse),
      address: ProjectSiteDataMapper.getApplicantAddressFromProjectSite(projectSiteResponse), 
      pan: ProjectSiteDataMapper.getApplicantPANFromProjectSite(projectSiteResponse)
    };

    console.log('📋 [PROJECT-SITE-API] Extracted applicant data:', extractedData);

    // Call the callback if provided
    if (options.onApplicantDataExtracted) {
      options.onApplicantDataExtracted(extractedData);
    }

    return extractedData;
  }, [options.onApplicantDataExtracted]);

  // Memoize getProjectSiteId to prevent recreation
  const getProjectSiteId = useCallback((): string | null => {
    try {
      const tokenStr = localStorage.getItem('token');
      if (tokenStr) {
        const tokenData = JSON.parse(tokenStr);
        
        if (tokenData.projectSiteId) {
          const decryptedProjectSiteId = encryptionService.get(tokenData.projectSiteId);
          console.log(`🔄 [${pageType.toUpperCase()} API]: Decrypted project site ID:`, decryptedProjectSiteId);
          return decryptedProjectSiteId;
        }
      }
    } catch (error) {
      console.error(`❌ [${pageType.toUpperCase()} API]: Error getting project site ID:`, error);
    }
    console.log(`🔄 [${pageType.toUpperCase()} API]: Using fallback project site ID: 493`);
    return '493';
  }, [pageType]);

  // Load dashboard counts (if enabled) - memoized
  const loadDashboardCounts = useCallback(async () => {
    if (!enableCounts) return;
    
    try {
      console.log(`🔄 [${pageType.toUpperCase()} API]: Loading dashboard counts...`);
      
      setDashboardCounts({
        projectSiteApplied: 1,
        rejected: 0,
        inbox: 0,
        closed: 0
      });
      
      console.log(`✅ [${pageType.toUpperCase()} API]: Dashboard counts set to static values`);
    } catch (err: any) {
      console.error(`❌ [${pageType.toUpperCase()} API]: Error loading dashboard counts:`, err);
    }
  }, [pageType, enableCounts]);

  // Load project site details - memoized with stable dependencies
  const loadProjectSiteDetails = useCallback(async (category?: string) => {
    // Prevent multiple simultaneous calls
    if (loading) {
      console.log(`⚠️ [${pageType.toUpperCase()} API]: Already loading, skipping duplicate call`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const logPrefix = category ? 
        `🔄 [${pageType.toUpperCase()} API]: Loading project site details for category: ${category}` :
        `🔄 [${pageType.toUpperCase()} API]: Loading project site details`;
      
      console.log(logPrefix);
      
      const projectSiteId = getProjectSiteId();
      
      if (!projectSiteId) {
        throw new Error('Project Site ID not found');
      }
      
      console.log(`🔄 [${pageType.toUpperCase()} API]: Making GET API call with ID:`, projectSiteId);
      
      const response = await axiosInterceptor.get<ProjectSiteAPIResponse>(
        `/ProjectSites/getProjectSitesDetails_ById?id=${projectSiteId}`
      );
      
      if (response.success && response.data?.formModel) {
        console.log(`✅ [${pageType.toUpperCase()} API]: Project site details loaded successfully`);
        console.log(`📊 [${pageType.toUpperCase()} API]: Response data:`, response.data.formModel);
        
        setProjectSiteData(response.data.formModel);
        
         if (options.autoFillContractorForm && pageType === 'contractorApplication') {
          extractApplicantData(response.data);
        }

        if (optionsRef.current.onDataLoaded) {
          optionsRef.current.onDataLoaded(response.data.formModel);
        }
        
      } else if (response.data?.hasError) {
        throw new Error(response.data.errorDesc || 'API returned an error');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load project site details';
      console.error(`❌ [${pageType.toUpperCase()} API]: Error:`, err);
      
      setError(errorMessage);
      setProjectSiteData(null);
      
      // Call error callback using ref to avoid dependency issues
      if (optionsRef.current.onError) {
        optionsRef.current.onError(errorMessage);
      } else {
        ToastService.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [pageType, getProjectSiteId, loading, extractApplicantData, options.autoFillContractorForm]); // Removed callbacks from dependencies

  // Get count for specific category (for dashboard) - memoized
  const getCountForCategory = useCallback((category: string): number => {
    switch (category) {
      case 'Project Site Applied': return dashboardCounts.projectSiteApplied;
      case 'Rejected': return dashboardCounts.rejected;
      case 'Inbox': return dashboardCounts.inbox;
      case 'Closed': return dashboardCounts.closed;
      default: return 0;
    }
  }, [dashboardCounts]);

  // Refresh data - memoized
  const refreshData = useCallback(async (category?: string) => {
    hasLoadedRef.current = false; // Reset the loaded flag
    if (enableCounts) {
      await loadDashboardCounts();
    }
    await loadProjectSiteDetails(category);
  }, [enableCounts, loadDashboardCounts, loadProjectSiteDetails]);

    const saveContractorApplication = useCallback(async (payload: ContractorApplicationPayload) => {
    if (contractorSaving) {
      console.log(`⚠️ [${pageType.toUpperCase()} API]: Already saving contractor data, skipping duplicate call`);
      return;
    }

    try {
      setContractorSaving(true);
      setContractorError(null);
      
      console.log(`🔄 [${pageType.toUpperCase()} API]: Saving contractor application...`);
      
      const response = await userDetailsService.saveContractorApplication(payload);
      
      if (response.success && response.data) {
        console.log(`✅ [${pageType.toUpperCase()} API]: Contractor application saved successfully`);
        
        if (optionsRef.current.onContractorSaveSuccess) {
          optionsRef.current.onContractorSaveSuccess(response.data);
        } else {
          ToastService.success('Contractor application saved successfully!');
        }
        
        return { success: true, data: response.data };
      } else {
        throw new Error(response.data?.error || 'Failed to save contractor application');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save contractor application';
      console.error(`❌ [${pageType.toUpperCase()} API]: Contractor save error:`, err);
      
      setContractorError(errorMessage);
      
      if (optionsRef.current.onContractorSaveError) {
        optionsRef.current.onContractorSaveError(errorMessage);
      } else {
        ToastService.error(errorMessage);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setContractorSaving(false);
    }
  }, [pageType, contractorSaving]);

  const loadContractorApplication = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setContractorError(null);
      
      console.log(`🔄 [${pageType.toUpperCase()} API]: Loading contractor application for ID:`, id);
      
      const response = await userDetailsService.getContractorApplication(id);
      
      if (response.success && response.data) {
        console.log(`✅ [${pageType.toUpperCase()} API]: Contractor application loaded successfully`);
        setContractorData(response.data);
        return response.data;
      } else {
        throw new Error('Failed to load contractor application');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load contractor application';
      console.error(`❌ [${pageType.toUpperCase()} API]: Contractor load error:`, err);
      
      setContractorError(errorMessage);
      setContractorData(null);
      
      if (optionsRef.current.onError) {
        optionsRef.current.onError(errorMessage);
      } else {
        ToastService.error(errorMessage);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [pageType]);

  // Clear contractor error
  const clearContractorError = useCallback(() => {
    setContractorError(null);
  }, []);

  // Auto-load data on component mount ONLY
  useEffect(() => {
    if (autoLoad && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      
      console.log(`🚀 [${pageType.toUpperCase()} API]: Auto-loading data...`);
      
      const loadData = async () => {
        if (enableCounts) {
          await loadDashboardCounts();
        }
        
        // For dashboard, load with default category
        if (pageType === 'dashboard') {
          await loadProjectSiteDetails('Project Site Applied');
        } else {
          await loadProjectSiteDetails();
        }
      };
      
      loadData();
    }
  }, []); 

  

  return {
    // Data
    projectSiteData,
    dashboardCounts,
    
    // States
    loading,
    error,
    
    // Add contractor-specific state to return
    contractorData,
    contractorSaving,
    contractorError,
    
    // Actions
    loadProjectSiteDetails,
    getCountForCategory,
    refreshData,
    getProjectSiteId,
    
    // Dashboard specific
    loadDashboardCounts,
    
    // Add contractor-specific actions to return
    extractApplicantData,
    saveContractorApplication,
    loadContractorApplication,
    clearContractorError
  };
};