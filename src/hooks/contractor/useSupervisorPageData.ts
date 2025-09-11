import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import encryptionService from '../../lib/encryptionService';
import { userDetailsService } from '../../services/api/userDetailsService';
import type { SupervisorData, WiremanData } from '../../types/supervisor.types';

interface PageData {
  supervisors: SupervisorData[];
  wiremans: WiremanData[];
  contractorData: any;
  totalSupervisors: number;
  totalWiremans: number;
  maxSupervisors: number;
  maxWiremans: number;
  appRefId: number | null;
  isLoading: boolean;
  hasExpiredSupervisors: boolean;
  hasExpiredWiremans: boolean;
}

interface UseSupervisorPageDataReturn extends PageData {
  loadData: () => Promise<void>;
  refreshData: () => Promise<void>;
  checkExpiryStatus: () => void;
}

/**
 * Hook to manage page-level data loading for supervisor page
 * Handles initial data loading, URL parameter parsing, and refresh logic
 */
export const useSupervisorPageData = (): UseSupervisorPageDataReturn => {
  const location = useLocation();
  
  const [data, setData] = useState<PageData>({
    supervisors: [],
    wiremans: [],
    contractorData: null,
    totalSupervisors: 0,
    totalWiremans: 0,
    maxSupervisors: 0,
    maxWiremans: 0,
    appRefId: null,
    isLoading: true,
    hasExpiredSupervisors: false,
    hasExpiredWiremans: false,
  });

  /**
   * Parse encrypted URL parameters
   */
  const parseUrlParams = (): number | null => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const encryptedParams = searchParams.get('data');
      
      if (!encryptedParams) {
        console.log('📄 [PAGE-DATA] No encrypted parameters found');
        return null;
      }

      console.log('🔐 [PAGE-DATA] Decrypting URL parameters...');
      const decryptedData = encryptionService.decrypt(encryptedParams);
      const parsedData = JSON.parse(decryptedData);
      
      console.log('✅ [PAGE-DATA] Parsed URL data:', parsedData);
      return parsedData?.id || parsedData?.appRefId || null;
    } catch (error) {
      console.error('❌ [PAGE-DATA] Error parsing URL parameters:', error);
      return null;
    }
  };

  /**
   * Check if any certificates are expired
   */
  const checkExpiryStatus = () => {
    const now = new Date();
    
    const hasExpiredSupervisors = data.supervisors.some(supervisor => {
      if (!supervisor.licenceValidUpto) return false;
      const expiryDate = new Date(supervisor.licenceValidUpto);
      return expiryDate < now;
    });

    const hasExpiredWiremans = data.wiremans.some(wireman => {
      if (!wireman.licenceValidUpto) return false;
      const expiryDate = new Date(wireman.licenceValidUpto);
      return expiryDate < now;
    });

    setData(prev => ({
      ...prev,
      hasExpiredSupervisors,
      hasExpiredWiremans
    }));

    if (hasExpiredSupervisors || hasExpiredWiremans) {
      console.warn('⚠️ [PAGE-DATA] Found expired certificates!', {
        expiredSupervisors: hasExpiredSupervisors,
        expiredWiremans: hasExpiredWiremans
      });
    }
  };

  /**
   * Load contractor worker details and lists
   */
  const loadData = async (): Promise<void> => {
    try {
      setData(prev => ({ ...prev, isLoading: true }));
      
      const appRefId = parseUrlParams();
      if (!appRefId) {
        console.log('📄 [PAGE-DATA] No appRefId found, skipping data load');
        setData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      console.log('📋 [PAGE-DATA] Loading contractor data for appRefId:', appRefId);
      
      // Load contractor details
      const contractorResponse = await userDetailsService.getContractorWorkerDetails(appRefId);
      
      if (!contractorResponse?.data) {
        console.warn('⚠️ [PAGE-DATA] No contractor data received');
        setData(prev => ({ ...prev, isLoading: false, appRefId }));
        return;
      }

      const contractorData = contractorResponse.data;
      console.log('✅ [PAGE-DATA] Contractor data loaded:', contractorData);

      // Extract supervisor and wireman lists
      const supervisors: SupervisorData[] = contractorData.SupervisorList || [];
      const wiremans: WiremanData[] = contractorData.WiremanList || [];

      // Calculate totals and limits
      const totalSupervisors = supervisors.length;
      const totalWiremans = wiremans.length;
      
      // Extract max limits from contractor data (Angular logic equivalent)
      const maxSupervisors = contractorData.MaxSupervisors || 10; // Default fallback
      const maxWiremans = contractorData.MaxWiremans || 10; // Default fallback

      setData({
        supervisors,
        wiremans,
        contractorData,
        totalSupervisors,
        totalWiremans,
        maxSupervisors,
        maxWiremans,
        appRefId,
        isLoading: false,
        hasExpiredSupervisors: false,
        hasExpiredWiremans: false,
      });

      console.log('📊 [PAGE-DATA] Data summary:', {
        supervisors: totalSupervisors,
        wiremans: totalWiremans,
        maxSupervisors,
        maxWiremans
      });

    } catch (error) {
      console.error('❌ [PAGE-DATA] Error loading data:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Refresh data (reload from API)
   */
  const refreshData = async (): Promise<void> => {
    await loadData();
    checkExpiryStatus();
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [location.search]);

  // Check expiry status when data changes
  useEffect(() => {
    if (!data.isLoading && (data.supervisors.length > 0 || data.wiremans.length > 0)) {
      checkExpiryStatus();
    }
  }, [data.supervisors, data.wiremans, data.isLoading]);

  return {
    ...data,
    loadData,
    refreshData,
    checkExpiryStatus,
  };
};
