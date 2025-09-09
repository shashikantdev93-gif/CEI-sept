import { useState, useEffect, useMemo } from 'react';
import { useProjectSiteAPI } from './useProjectSiteAPI';

interface ApplicationAvailability {
  contractorAppsExist: boolean;
  supervisorAppsExist: boolean;
  wiremanAppsExist: boolean;
  contractorApplications: any[];
  supervisorApplications: any[];
  wiremanApplications: any[];
}

interface UseApplicationAvailabilityOptions {
  autoLoad?: boolean;
  onError?: (error: string) => void;
}

/**
 * Hook for checking application availability based on Angular's business rules
 * Implements the same logic as Angular's application-list.component.ts:
 * - Filters applications by applicationType (6=Contractor, 7=Supervisor, 8=Wireman)
 * - Provides boolean flags for button disable logic
 * - Follows Angular's "one application per type per project site" rule
 */
export const useApplicationAvailability = (options: UseApplicationAvailabilityOptions = {}) => {
  const { autoLoad = true, onError } = options;
  
  const [applicationAvailability, setApplicationAvailability] = useState<ApplicationAvailability>({
    contractorAppsExist: false,
    supervisorAppsExist: false,
    wiremanAppsExist: false,
    contractorApplications: [],
    supervisorApplications: [],
    wiremanApplications: []
  });

  // Use existing ProjectSite API hook
  const { projectSiteData, loading, error, loadProjectSiteDetails } = useProjectSiteAPI({
    pageType: 'applicationForm',
    autoLoad,
    onError: (errorMsg) => {
      console.error('🚨 [APPLICATION-AVAILABILITY] Project site API error:', errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    },
    onDataLoaded: (data) => {
      console.log('📊 [APPLICATION-AVAILABILITY] Project site data loaded:', data);
    }
  });

  // Calculate application availability whenever project site data changes
  const calculatedAvailability = useMemo(() => {
    if (!projectSiteData?.applications) {
      console.log('⚠️ [APPLICATION-AVAILABILITY] No applications data available');
      return {
        contractorAppsExist: false,
        supervisorAppsExist: false,
        wiremanAppsExist: false,
        contractorApplications: [],
        supervisorApplications: [],
        wiremanApplications: []
      };
    }

    console.log('🔍 [APPLICATION-AVAILABILITY] Processing applications:', projectSiteData.applications);

    // EXACT Angular logic from application-list.component.ts:
    // this.contractorApplicationDetails = this.projectSiteData.formModel.applications.filter(
    //   (element: any) => element.applicationType === 6
    // );
    const contractorApplications = projectSiteData.applications.filter(
      (app: any) => app.applicationType === 6
    );
    
    const supervisorApplications = projectSiteData.applications.filter(
      (app: any) => app.applicationType === 7
    );
    
    const wiremanApplications = projectSiteData.applications.filter(
      (app: any) => app.applicationType === 8
    );

    const availability = {
      contractorAppsExist: contractorApplications.length > 0,
      supervisorAppsExist: supervisorApplications.length > 0,
      wiremanAppsExist: wiremanApplications.length > 0,
      contractorApplications,
      supervisorApplications,
      wiremanApplications
    };

    console.log('🎯 [APPLICATION-AVAILABILITY] Calculated availability:', availability);
    console.log('📊 [APPLICATION-AVAILABILITY] Application counts:', {
      contractor: contractorApplications.length,
      supervisor: supervisorApplications.length,
      wireman: wiremanApplications.length
    });

    return availability;
  }, [projectSiteData?.applications]);

  // Update state when calculation changes
  useEffect(() => {
    setApplicationAvailability(calculatedAvailability);
  }, [calculatedAvailability]);

  // Manual refresh function
  const refreshAvailability = async () => {
    console.log('🔄 [APPLICATION-AVAILABILITY] Manual refresh triggered');
    await loadProjectSiteDetails();
  };

  return {
    // Application availability flags (Angular parity)
    ...applicationAvailability,
    
    // State management
    loading,
    error,
    projectSiteData,
    
    // Actions
    refreshAvailability,
    
    // Debug information
    debugInfo: {
      hasProjectSiteData: !!projectSiteData,
      applicationsCount: projectSiteData?.applications?.length || 0,
      calculatedAt: new Date().toISOString()
    }
  };
};
