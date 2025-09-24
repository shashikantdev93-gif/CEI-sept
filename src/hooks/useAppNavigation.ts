import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useRef } from 'react';
import { NavigationService, AppRoutes, type AppRoute, type DraftNavigationData, type NavigationOptions } from '../services/navigationService';

/**
 * Custom hook for centralized navigation using the enhanced navigation service
 * Replaces direct useNavigate() usage across components
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceRef = useRef<NavigationService | null>(null);

  // Initialize service once
  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = new NavigationService({
        enableEncryption: true,
        enableLogging: true,
        fallbackToPlainNavigation: true
      });
    }
    serviceRef.current.initialize(navigate, location);
  }, [navigate, location]);

  // Navigate to a predefined route
  const navigateTo = useCallback((route: AppRoute, options?: NavigationOptions) => {
    if (!serviceRef.current) {
      console.warn('Navigation service not initialized, falling back to direct navigation');
      navigate(route, { replace: options?.replace });
      return;
    }
    
    serviceRef.current.navigateTo(route, undefined, options);
  }, [navigate]);

  // Navigate to any path (for dynamic routes)
  const navigateToPath = useCallback((path: string, options?: NavigationOptions) => {
    if (!serviceRef.current) {
      console.warn('Navigation service not initialized, falling back to direct navigation');
      navigate(path, { replace: options?.replace });
      return;
    }
    
    serviceRef.current.navigateTo(path, undefined, options);
  }, [navigate]);

  // Navigate with draft data (for form continuation)
  const navigateWithDraft = useCallback((route: AppRoute, draftData: DraftNavigationData, options?: NavigationOptions) => {
    if (!serviceRef.current) {
      console.warn('Navigation service not initialized, falling back to direct navigation');
      navigate(route, { replace: options?.replace });
      return;
    }
    
    serviceRef.current.navigateWithDraftData(route, draftData, options);
  }, [navigate]);

  // Navigate back
  const navigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Navigate to login
  const navigateToLogin = useCallback(() => {
    navigateTo(AppRoutes.LOGIN, { clearSessionData: true });
  }, [navigateTo]);

  // Navigate to dashboard
  const navigateToDashboard = useCallback(() => {
    navigateTo(AppRoutes.DASHBOARD);
  }, [navigateTo]);

  // Navigate to contractor details
  const navigateToContractorDetails = useCallback((draftData?: DraftNavigationData) => {
    if (draftData) {
      navigateWithDraft(AppRoutes.CONTRACTOR_DETAILS, draftData);
    } else {
      navigateTo(AppRoutes.CONTRACTOR_DETAILS);
    }
  }, [navigateTo, navigateWithDraft]);

  // Navigate to supervisor registration
  const navigateToSupervisorRegistration = useCallback((draftData?: DraftNavigationData) => {
    if (draftData) {
      navigateWithDraft(AppRoutes.SUPERVISOR_REGISTRATION, draftData);
    } else {
      navigateTo(AppRoutes.SUPERVISOR_REGISTRATION);
    }
  }, [navigateTo, navigateWithDraft]);

  // Navigate to wireman registration
  const navigateToWiremanRegistration = useCallback((draftData?: DraftNavigationData) => {
    if (draftData) {
      navigateWithDraft(AppRoutes.WIREMAN_REGISTRATION, draftData);
    } else {
      navigateTo(AppRoutes.WIREMAN_REGISTRATION);
    }
  }, [navigateTo, navigateWithDraft]);

  // Get current route information
  const getCurrentRoute = useCallback(() => {
    return {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state
    };
  }, [location]);

  // Check if current route is a specific route
  const isCurrentRoute = useCallback((route: AppRoute) => {
    return location.pathname === route;
  }, [location.pathname]);

  // Build encrypted URL for external use (emails, etc.)
  const buildEncryptedUrl = useCallback((baseUrl: string, route: string, params: Record<string, any>): string => {
    if (!serviceRef.current) {
      console.warn('Navigation service not initialized, returning plain URL');
      return `${baseUrl}${route}`;
    }
    
    return serviceRef.current.buildEncryptedUrl(baseUrl, route, params);
  }, []);

  return {
    // Core navigation functions
    navigateTo,
    navigateToPath,
    navigateWithDraft,
    navigateBack,
    
    // Specific navigation functions
    navigateToLogin,
    navigateToDashboard,
    navigateToContractorDetails,
    navigateToSupervisorRegistration,
    navigateToWiremanRegistration,
    
    // Route information
    getCurrentRoute,
    isCurrentRoute,
    
    // Utility functions
    buildEncryptedUrl,
    
    // Route constants for convenience
    routes: AppRoutes,
    
    // Current location
    currentLocation: location
  };
};

// Type exports for consumers
export type { AppRoute, DraftNavigationData, NavigationOptions } from '../services/navigationService';