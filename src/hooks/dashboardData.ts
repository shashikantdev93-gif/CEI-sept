import { useState, useEffect } from 'react';
import { axiosInterceptor } from '../lib/interceptor';
import { ToastService } from '../utils';

interface DashboardData {
  consumerDashboardTableData?: any;
  processed?: number;
  pending?: number;
  rejected?: number;
  projectSiteApplied?: number;
}

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [Dashboard Hook]: Loading dashboard data...');
      
      const response = await axiosInterceptor.post('/ProjectSites/getProjectSitesDetails_ById', {});
      
      if (response.success && response.data) {
        console.log('✅ [Dashboard Hook]: Dashboard data loaded successfully');
        setDashboardData(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('❌ [Dashboard Hook]: Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      ToastService.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    dashboardData,
    loading,
    error,
    refetch: loadDashboardData
  };
};