import type { NavigateFunction, Location } from 'react-router-dom';
import encryptionService from '../lib/encryptionService';

// Navigation service configuration
export interface NavigationConfig {
  enableEncryption: boolean;
  enableLogging: boolean;
  fallbackToPlainNavigation: boolean;
  baseUrl?: string;
}

// Navigation options
export interface NavigationOptions {
  replace?: boolean;
  encrypted?: boolean;
  preserveCurrentParams?: boolean;
  clearSessionData?: boolean;
  confirmNavigation?: boolean;
  confirmMessage?: string;
}

// Route parameter types
export type RouteParams = Record<string, any>;

// Navigation result
export interface NavigationResult {
  success: boolean;
  targetUrl?: string;
  error?: string;
}

// Application routes constants for type safety
export const AppRoutes = {
  // Auth routes
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  
  // Application forms
  CONTRACTOR_FORM: '/contractor-form',
  CONTRACTOR_DETAILS: '/dashboard/ProjectDetails/applicationForm/contractor-applicant-details',
  CONTRACTOR_SUPERVISOR: '/dashboard/ProjectDetails/applicationForm/contractor-supervisor',
  CONTRACTOR_DOCUMENTS: '/dashboard/ProjectDetails/applicationForm/contractor-documents',
  
  // Supervisor routes
  SUPERVISOR_REGISTRATION: '/dashboard/ProjectDetails/applicationForm/supervisor-registration',
  SUPERVISOR_DOCUMENTS: '/dashboard/ProjectDetails/applicationForm/supervisor-registration/upload-supervisor-document',
  
  // Wireman routes
  WIREMAN_REGISTRATION: '/dashboard/ProjectDetails/applicationForm/wireman-information',
  WIREMAN_DOCUMENTS: '/dashboard/ProjectDetails/applicationForm/supervisor-registration/upload-wireman-document',
  
  // Project routes
  PROJECT_DETAILS: '/dashboard/ProjectDetails',
  PROJECT_SITE: '/dashboard/ProjectDetails/project-site',
  
  // Other routes
  APPLICATION_FORM: '/dashboard/ProjectDetails/applicationForm',
} as const;

export type AppRoute = typeof AppRoutes[keyof typeof AppRoutes];

// Draft navigation types for different application types
export interface DraftNavigationData {
  appRefId: number;
  formMode: 'new' | 'edit' | 'draft';
  applicationContractorType?: string;
  isFormLocked?: boolean;
  applicationType?: string;
  appformstep?: number;
  previousRouteUrl?: string;
  is30DaysCrossed?: boolean;
}

// Navigation Service
export class NavigationService {
  private config: NavigationConfig;
  private navigate: NavigateFunction | null = null;
  private currentLocation: Location | null = null;

  constructor(config: Partial<NavigationConfig> = {}) {
    this.config = {
      enableEncryption: true,
      enableLogging: true,
      fallbackToPlainNavigation: true,
      ...config,
    };
  }

  // Initialize with React Router hooks
  initialize(navigate: NavigateFunction, location: Location): void {
    this.navigate = navigate;
    this.currentLocation = location;
    this.log('info', 'Navigation service initialized', { currentPath: location.pathname });
  }

  // Logging utility
  private log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.config.enableLogging) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [NAV-SERVICE] ${message}`;

    switch (level) {
      case 'info':
        console.log(`🧭 ${logMessage}`, data || '');
        break;
      case 'warn':
        console.warn(`⚠️ ${logMessage}`, data || '');
        break;
      case 'error':
        console.error(`❌ ${logMessage}`, data || '');
        break;
    }
  }

  // Check if navigation service is ready
  private assertReady(): void {
    if (!this.navigate || !this.currentLocation) {
      throw new Error('Navigation service not initialized. Call initialize() first.');
    }
  }

  // Encrypt parameters for URL
  private encryptParams(params: RouteParams): string | null {
    if (!this.config.enableEncryption) return null;

    try {
      const serialized = JSON.stringify(params);
      return encryptionService.encrypt(serialized);
    } catch (error) {
      this.log('error', 'Failed to encrypt parameters', error);
      return null;
    }
  }

  // Decrypt parameters from URL
  private decryptParams(encryptedData: string): RouteParams | null {
    if (!this.config.enableEncryption) return null;

    try {
      const decrypted = encryptionService.decrypt(encryptedData);
      return JSON.parse(decrypted);
    } catch (error) {
      this.log('error', 'Failed to decrypt parameters', error);
      return null;
    }
  }

  // Build navigation URL with parameters
  private buildNavigationUrl(
    route: string, 
    params?: RouteParams, 
    options: NavigationOptions = {}
  ): string {
    if (!params || Object.keys(params).length === 0) {
      return route;
    }

    const searchParams = new URLSearchParams();

    // Preserve current params if requested
    if (options.preserveCurrentParams && this.currentLocation) {
      const currentParams = new URLSearchParams(this.currentLocation.search);
      currentParams.forEach((value, key) => {
        searchParams.set(key, value);
      });
    }

    // Handle encrypted vs plain parameters
    if (options.encrypted !== false && this.config.enableEncryption) {
      const encryptedData = this.encryptParams(params);
      if (encryptedData) {
        searchParams.set('data', encryptedData);
      } else if (this.config.fallbackToPlainNavigation) {
        // Fallback to individual parameters
        Object.entries(params).forEach(([key, value]) => {
          searchParams.set(key, String(value));
        });
      }
    } else {
      // Plain parameters
      Object.entries(params).forEach(([key, value]) => {
        searchParams.set(key, String(value));
      });
    }

    const queryString = searchParams.toString();
    return queryString ? `${route}?${queryString}` : route;
  }

  // Core navigation method
  navigateTo(
    route: string | AppRoute, 
    params?: RouteParams, 
    options: NavigationOptions = {}
  ): NavigationResult {
    this.assertReady();

    try {
      const targetRoute = typeof route === 'string' ? route : route;
      
      // Confirmation dialog if requested
      if (options.confirmNavigation) {
        const message = options.confirmMessage || 'Are you sure you want to navigate away?';
        if (!window.confirm(message)) {
          this.log('info', 'Navigation cancelled by user');
          return { success: false, error: 'Navigation cancelled by user' };
        }
      }

      // Clear session data if requested
      if (options.clearSessionData) {
        this.clearNavigationSessionData();
      }

      // Build target URL
      const targetUrl = this.buildNavigationUrl(targetRoute, params, options);

      this.log('info', `Navigating to: ${targetRoute}`, { params, targetUrl, options });

      // Perform navigation
      this.navigate!(targetUrl, { replace: options.replace });

      return { success: true, targetUrl };

    } catch (error: any) {
      this.log('error', 'Navigation failed', error);
      return { success: false, error: error.message };
    }
  }

  // Get current route parameters
  getCurrentParams(): RouteParams {
    if (!this.currentLocation) return {};

    const searchParams = new URLSearchParams(this.currentLocation.search);
    
    // Try to decrypt encrypted data first
    const encryptedData = searchParams.get('data');
    if (encryptedData) {
      const decryptedParams = this.decryptParams(encryptedData);
      if (decryptedParams) {
        this.log('info', 'Retrieved encrypted parameters', decryptedParams);
        return decryptedParams;
      }
    }

    // Fallback to plain parameters
    const plainParams: RouteParams = {};
    searchParams.forEach((value, key) => {
      if (key !== 'data') { // Skip encrypted data parameter
        plainParams[key] = value;
      }
    });

    this.log('info', 'Retrieved plain parameters', plainParams);
    return plainParams;
  }

  // Navigate back
  navigateBack(fallbackRoute?: string | AppRoute): NavigationResult {
    this.assertReady();

    try {
      if (window.history.length > 1) {
        this.navigate!(-1);
        this.log('info', 'Navigated back using browser history');
        return { success: true };
      } else if (fallbackRoute) {
        return this.navigateTo(fallbackRoute);
      } else {
        return this.navigateTo(AppRoutes.DASHBOARD);
      }
    } catch (error: any) {
      this.log('error', 'Navigate back failed', error);
      return { success: false, error: error.message };
    }
  }

  // Application-specific navigation methods
  
  // Contractor navigation
  navigateToContractorDetails(appRefId: number, options?: NavigationOptions): NavigationResult {
    return this.navigateTo(AppRoutes.CONTRACTOR_DETAILS, { appRefId }, options);
  }

  navigateToContractorSupervisor(appRefId: number, options?: NavigationOptions): NavigationResult {
    return this.navigateTo(AppRoutes.CONTRACTOR_SUPERVISOR, { appRefId }, options);
  }

  navigateToContractorDocuments(appRefId: number, options?: NavigationOptions): NavigationResult {
    return this.navigateTo(AppRoutes.CONTRACTOR_DOCUMENTS, { appRefId }, options);
  }

  // Supervisor navigation
  navigateToSupervisorRegistration(draftData?: DraftNavigationData, options?: NavigationOptions): NavigationResult {
    return this.navigateTo(AppRoutes.SUPERVISOR_REGISTRATION, draftData, options);
  }

  navigateToSupervisorDocuments(options?: NavigationOptions): NavigationResult {
    return this.navigateTo(AppRoutes.SUPERVISOR_DOCUMENTS, undefined, options);
  }

  // Wireman navigation
  navigateToWiremanRegistration(draftData?: DraftNavigationData, options?: NavigationOptions): NavigationResult {
    return this.navigateTo(AppRoutes.WIREMAN_REGISTRATION, draftData, options);
  }

  navigateToWiremanDocuments(options?: NavigationOptions): NavigationResult {
    return this.navigateTo(AppRoutes.WIREMAN_DOCUMENTS, undefined, options);
  }

  // Dashboard navigation
  navigateToDashboard(params?: RouteParams, options?: NavigationOptions): NavigationResult {
    return this.navigateTo(AppRoutes.DASHBOARD, params, options);
  }

  // Project navigation
  navigateToProjectDetails(params?: RouteParams, options?: NavigationOptions): NavigationResult {
    return this.navigateTo(AppRoutes.PROJECT_DETAILS, params, options);
  }

  // Draft navigation utilities
  navigateWithDraftData(
    route: string | AppRoute,
    draftData: DraftNavigationData,
    options?: NavigationOptions
  ): NavigationResult {
    // Set session flags for draft navigation
    sessionStorage.setItem('allowDraftNavigation', 'true');
    sessionStorage.setItem('draftApplicationData', JSON.stringify(draftData));

    return this.navigateTo(route, draftData, {
      ...options,
      encrypted: true,
    });
  }

  // Build encrypted URL for external use (emails, etc.)
  buildEncryptedUrl(baseUrl: string, route: string, params: Record<string, any>): string {
    try {
      const encryptedData = this.encryptParams(params);
      if (!encryptedData) {
        this.log('warn', 'Failed to encrypt parameters for URL building');
        return `${baseUrl}${route}`;
      }
      
      const searchParams = new URLSearchParams();
      searchParams.set('data', encryptedData);
      
      const finalUrl = `${baseUrl}${route}?${searchParams.toString()}`;
      this.log('info', 'Built encrypted URL', { baseUrl, route, finalUrl });
      return finalUrl;
    } catch (error: any) {
      this.log('error', 'Error building encrypted URL', error);
      return `${baseUrl}${route}`;
    }
  }

  // Clear navigation-related session data
  clearNavigationSessionData(): void {
    const keysToRemove = [
      'allowDraftNavigation',
      'draftApplicationData',
      'allowUploadSupervisorDocumentNavigation',
      'allowUploadWiremanDocumentNavigation',
      'allowContractorDocumentNavigation',
    ];

    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
    });

    this.log('info', 'Cleared navigation session data');
  }

  // Check if navigation is allowed for protected routes
  isNavigationAllowed(route: string): boolean {
    switch (route) {
      case AppRoutes.SUPERVISOR_DOCUMENTS:
        return sessionStorage.getItem('allowUploadSupervisorDocumentNavigation') === 'true';
      case AppRoutes.WIREMAN_DOCUMENTS:
        return sessionStorage.getItem('allowUploadWiremanDocumentNavigation') === 'true';
      case AppRoutes.CONTRACTOR_DOCUMENTS:
        return sessionStorage.getItem('allowContractorDocumentNavigation') === 'true';
      default:
        return true;
    }
  }

  // Enable navigation for protected routes
  enableProtectedNavigation(route: string): void {
    switch (route) {
      case AppRoutes.SUPERVISOR_DOCUMENTS:
        sessionStorage.setItem('allowUploadSupervisorDocumentNavigation', 'true');
        break;
      case AppRoutes.WIREMAN_DOCUMENTS:
        sessionStorage.setItem('allowUploadWiremanDocumentNavigation', 'true');
        break;
      case AppRoutes.CONTRACTOR_DOCUMENTS:
        sessionStorage.setItem('allowContractorDocumentNavigation', 'true');
        break;
    }

    this.log('info', `Enabled protected navigation for: ${route}`);
  }

  // Get current route information
  getCurrentRoute(): { path: string; params: RouteParams; isProtected: boolean } {
    if (!this.currentLocation) {
      return { path: '/', params: {}, isProtected: false };
    }

    return {
      path: this.currentLocation.pathname,
      params: this.getCurrentParams(),
      isProtected: !this.isNavigationAllowed(this.currentLocation.pathname),
    };
  }
}

// Create and export singleton instance
export const navigationService = new NavigationService();

// React hook for easy navigation service usage
export const useNavigationService = () => {
  return navigationService;
};

// Legacy compatibility functions (to maintain existing code compatibility)
export const NavigationUtils = {
  navigateWithEncryptedParams: (
    navigate: NavigateFunction,
    route: string,
    params: RouteParams,
    options?: { replace?: boolean }
  ) => {
    const service = new NavigationService();
    service.initialize(navigate, window.location as any);
    return service.navigateTo(route, params, { ...options, encrypted: true });
  },

  getDecryptedParams: (searchParams: URLSearchParams): RouteParams | null => {
    const service = new NavigationService();
    const encryptedData = searchParams.get('data');
    if (!encryptedData) return null;
    
    return service['decryptParams'](encryptedData);
  },

  navigateToContractorForm: (navigate: NavigateFunction, appRefId: number) => {
    const service = new NavigationService();
    service.initialize(navigate, window.location as any);
    return service.navigateToContractorDetails(appRefId);
  },
};