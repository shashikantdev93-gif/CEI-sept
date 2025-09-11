/**
 * Working Area Logic Hook for Contractor Supervisor Page
 * 
 * This hook manages the working area logic for the supervisor-details page,
 * including district/tehsil filtering, duplicate prevention, and completion validation.
 * 
 * Features:
 * - Integrates with existing working area system from contractor form
 * - Filters tehsils based on selected districts
 * - Prevents duplicate supervisor/wireman entries for same working area
 * - Validates completion requirements
 * - Manages navigation logic
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { WorkingArea } from '../types/contractor.types';
import type { SupervisorData, WiremanData } from '../types/supervisor.types';
import { useLocation } from './useLocation';

interface WorkingAreaState {
  workingAreaList: WorkingArea[];
  selectedWorkingAreaTehsilsList: Array<{ tehsilRefId: number; tehsilName: string; districtRefId: number; districtName: string }>;
  isLoading: boolean;
  error: string | null;
}

interface WorkingAreaLogicReturn {
  // State
  workingAreaList: WorkingArea[];
  selectedWorkingAreaTehsilsList: Array<{ tehsilRefId: number; tehsilName: string; districtRefId: number; districtName: string }>;
  isLoading: boolean;
  error: string | null;
  
  // Computed values
  availableDistricts: Array<{ districtRefId: number; districtName: string }>;
  completionStatus: {
    totalAreas: number;
    supervisorCoverage: number;
    wiremanCoverage: number;
    isComplete: boolean;
    missingAreas: WorkingArea[];
  };
  
  // Methods
  getAllWorkingTehsils: (districtRefId: number) => Array<{ tehsilRefId: number; tehsilName: string }>;
  checkDuplicateSupervisor: (districtRefId: number, tehsilRefId: number, supervisorsList: SupervisorData[]) => boolean;
  checkDuplicateWireman: (districtRefId: number, tehsilRefId: number, wiremansList: WiremanData[]) => boolean;
  validateCompletionRequirements: (supervisorsList: SupervisorData[], wiremansList: WiremanData[]) => {
    isValid: boolean;
    message: string;
    expiredLicences: {
      supervisors: string[];
      wiremans: string[];
    };
  };
  getDistrictName: (districtRefId: number) => string;
  getTehsilName: (tehsilRefId: number) => string;
  refreshWorkingAreas: () => Promise<void>;
}

export const useWorkingAreaLogic = (): WorkingAreaLogicReturn => {
  // Location data for districts/tehsils
  const { districts, tehsils, loading: locationLoading } = useLocation();
  
  // Working area state
  const [workingAreaState, setWorkingAreaState] = useState<WorkingAreaState>({
    workingAreaList: [],
    selectedWorkingAreaTehsilsList: [],
    isLoading: true,
    error: null
  });

  // Initialize working area data from URL params or local storage
  useEffect(() => {
    const initializeWorkingAreas = async () => {
      try {
        setWorkingAreaState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Try to get working area list from URL params first (Angular pattern)
        const urlParams = new URLSearchParams(window.location.search);
        const workingAreaParam = urlParams.get('workingAreaList');
        
        let workingAreaList: WorkingArea[] = [];
        
        if (workingAreaParam) {
          try {
            // Decrypt and parse if needed (matching Angular pattern)
            const decryptedParam = decodeURIComponent(workingAreaParam);
            workingAreaList = JSON.parse(decryptedParam);
            console.log('🌍 [WORKING_AREA] Loaded from URL params:', workingAreaList.length, 'areas');
          } catch (parseError) {
            console.warn('⚠️ [WORKING_AREA] Failed to parse URL param, trying localStorage');
          }
        }
        
        // Fallback to localStorage or contractor form data
        if (workingAreaList.length === 0) {
          const storedAreas = localStorage.getItem('contractorWorkingAreas');
          if (storedAreas) {
            try {
              workingAreaList = JSON.parse(storedAreas);
              console.log('🌍 [WORKING_AREA] Loaded from localStorage:', workingAreaList.length, 'areas');
            } catch (parseError) {
              console.warn('⚠️ [WORKING_AREA] Failed to parse localStorage data');
            }
          }
        }
        
        // Update state
        setWorkingAreaState(prev => ({
          ...prev,
          workingAreaList,
          isLoading: false,
          error: workingAreaList.length === 0 ? 'No working areas found. Please complete contractor details first.' : null
        }));
        
        console.log('✅ [WORKING_AREA] Initialization complete:', workingAreaList.length, 'areas loaded');
        
      } catch (error) {
        console.error('❌ [WORKING_AREA] Error initializing working areas:', error);
        setWorkingAreaState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load working areas. Please try again.'
        }));
      }
    };

    initializeWorkingAreas();
  }, []);

  // Get unique districts from working areas
  const availableDistricts = useMemo(() => {
    const uniqueDistricts = new Map<number, string>();
    
    workingAreaState.workingAreaList.forEach(area => {
      if (area.districtRefId && area.district) {
        uniqueDistricts.set(area.districtRefId, area.district);
      }
    });
    
    return Array.from(uniqueDistricts.entries()).map(([districtRefId, districtName]) => ({
      districtRefId,
      districtName
    }));
  }, [workingAreaState.workingAreaList]);

  // Get working tehsils for a district (matches Angular getAllWorkingTehsils)
  const getAllWorkingTehsils = useCallback((districtRefId: number) => {
    const tehsilsForDistrict = workingAreaState.workingAreaList
      .filter(area => area.districtRefId === districtRefId)
      .map(area => ({
        tehsilRefId: area.tehsilRefId,
        tehsilName: area.tehsil || area.tehsilName || ''
      }));
    
    // Remove duplicates
    const uniqueTehsils = tehsilsForDistrict.filter((tehsil, index, array) => 
      array.findIndex(t => t.tehsilRefId === tehsil.tehsilRefId) === index
    );
    
    console.log('🏘️ [WORKING_AREA] Tehsils for district', districtRefId, ':', uniqueTehsils.length, 'tehsils');
    return uniqueTehsils;
  }, [workingAreaState.workingAreaList]);

  // Check if supervisor already exists for working area (matches Angular addSupervisor logic)
  const checkDuplicateSupervisor = useCallback((
    districtRefId: number, 
    tehsilRefId: number, 
    supervisorsList: SupervisorData[]
  ): boolean => {
    const exists = supervisorsList.some((supervisor: SupervisorData) =>
      supervisor.districtRefId === districtRefId &&
      supervisor.tehsilRefId === tehsilRefId
    );
    
    if (exists) {
      console.log('⚠️ [WORKING_AREA] Duplicate supervisor found for district:', districtRefId, 'tehsil:', tehsilRefId);
    }
    
    return exists;
  }, []);

  // Check if wireman already exists for working area (matches Angular addWireman logic)
  const checkDuplicateWireman = useCallback((
    districtRefId: number, 
    tehsilRefId: number, 
    wiremansList: WiremanData[]
  ): boolean => {
    const exists = wiremansList.some((wireman: WiremanData) =>
      wireman.districtRefId === districtRefId &&
      wireman.tehsilRefId === tehsilRefId
    );
    
    if (exists) {
      console.log('⚠️ [WORKING_AREA] Duplicate wireman found for district:', districtRefId, 'tehsil:', tehsilRefId);
    }
    
    return exists;
  }, []);

  // Calculate completion status
  const completionStatus = useMemo(() => {
    const totalAreas = workingAreaState.workingAreaList.length;
    
    // This will be populated when supervisors/wiremans are passed
    const supervisorCoverage = 0; // Will be calculated by parent component
    const wiremanCoverage = 0; // Will be calculated by parent component
    
    const isComplete = supervisorCoverage === totalAreas && wiremanCoverage === totalAreas;
    
    const missingAreas = workingAreaState.workingAreaList.filter(() => {
      // This logic will be updated when supervisor/wireman data is available
      return false; // Placeholder
    });
    
    return {
      totalAreas,
      supervisorCoverage,
      wiremanCoverage,
      isComplete,
      missingAreas
    };
  }, [workingAreaState.workingAreaList]);

  // Validate completion requirements (matches Angular save logic)
  const validateCompletionRequirements = useCallback((
    supervisorsList: SupervisorData[], 
    wiremansList: WiremanData[]
  ) => {
    const totalAreas = workingAreaState.workingAreaList.length;
    const supervisorCount = supervisorsList.length;
    const wiremanCount = wiremansList.length;
    
    console.log('📊 [WORKING_AREA] Completion validation:');
    console.log('📊 [WORKING_AREA] - Total areas:', totalAreas);
    console.log('📊 [WORKING_AREA] - Supervisors:', supervisorCount);
    console.log('📊 [WORKING_AREA] - Wiremans:', wiremanCount);
    
    // Check if all areas are covered
    if (supervisorCount < totalAreas || wiremanCount < totalAreas) {
      return {
        isValid: false,
        message: 'Please complete Supervisor and Wireman list for all working areas',
        expiredLicences: { supervisors: [], wiremans: [] }
      };
    }
    
    // Check for expired licences (matches Angular save logic)
    const expiredSupervisorLicences = supervisorsList
      .filter((supervisor: SupervisorData) => supervisor.licenceExpired)
      .map((supervisor: SupervisorData) => supervisor.licenceNo);

    const expiredWiremanLicences = wiremansList
      .filter((wireman: WiremanData) => wireman.licenceExpired)
      .map((wireman: WiremanData) => wireman.licenceNo);
    
    if (expiredSupervisorLicences.length > 0 || expiredWiremanLicences.length > 0) {
      const expiredMessage = `The following licences have expired:\n` +
        (expiredSupervisorLicences.length > 0 ? `Supervisors: ${expiredSupervisorLicences.join(', ')}\n` : '') +
        (expiredWiremanLicences.length > 0 ? `Wiremans: ${expiredWiremanLicences.join(', ')}\n` : '') +
        'Please update the expired licences before proceeding.';
      
      return {
        isValid: false,
        message: expiredMessage,
        expiredLicences: {
          supervisors: expiredSupervisorLicences,
          wiremans: expiredWiremanLicences
        }
      };
    }
    
    return {
      isValid: true,
      message: 'All working areas are properly covered',
      expiredLicences: { supervisors: [], wiremans: [] }
    };
  }, [workingAreaState.workingAreaList]);

  // Get district name by ID
  const getDistrictName = useCallback((districtRefId: number): string => {
    const district = districts.find(d => d.districtCode === districtRefId);
    return district?.districtName || `District ${districtRefId}`;
  }, [districts]);

  // Get tehsil name by ID
  const getTehsilName = useCallback((tehsilRefId: number): string => {
    const tehsil = tehsils.find(t => t.tehsilId === tehsilRefId);
    return tehsil?.tehsilName || `Tehsil ${tehsilRefId}`;
  }, [tehsils]);

  // Refresh working areas from latest data
  const refreshWorkingAreas = useCallback(async () => {
    setWorkingAreaState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Try to get updated data from localStorage or API
      const storedAreas = localStorage.getItem('contractorWorkingAreas');
      if (storedAreas) {
        const workingAreaList = JSON.parse(storedAreas);
        setWorkingAreaState(prev => ({
          ...prev,
          workingAreaList,
          isLoading: false,
          error: null
        }));
      }
    } catch (error) {
      console.error('❌ [WORKING_AREA] Error refreshing working areas:', error);
      setWorkingAreaState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to refresh working areas'
      }));
    }
  }, []);

  return {
    // State
    workingAreaList: workingAreaState.workingAreaList,
    selectedWorkingAreaTehsilsList: workingAreaState.selectedWorkingAreaTehsilsList,
    isLoading: workingAreaState.isLoading || locationLoading.districts || locationLoading.tehsils,
    error: workingAreaState.error,
    
    // Computed values
    availableDistricts,
    completionStatus,
    
    // Methods
    getAllWorkingTehsils,
    checkDuplicateSupervisor,
    checkDuplicateWireman,
    validateCompletionRequirements,
    getDistrictName,
    getTehsilName,
    refreshWorkingAreas
  };
};
