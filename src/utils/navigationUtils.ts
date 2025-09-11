import type { NavigateFunction } from 'react-router-dom';
import encryptionService from '../lib/encryptionService';

/**
 * Navigation utilities for encrypted route parameters
 * Matches Angular encrypted navigation functionality
 */
export class NavigationUtils {
  
  /**
   * Navigate to a route with encrypted parameters
   * Angular equivalent: router.navigate with queryParams encryption
   */
  static navigateWithEncryptedParams(
    navigate: NavigateFunction,
    route: string,
    params: Record<string, any>,
    options?: { replace?: boolean }
  ): void {
    try {
      console.log('🧭 [NAVIGATION] Navigating to:', route, 'with params:', params);
      
      // Encrypt the parameters
      const encryptedData = encryptionService.encrypt(JSON.stringify(params));
      
      // Create the URL with encrypted query parameter
      const searchParams = new URLSearchParams();
      searchParams.set('data', encryptedData);
      
      const targetUrl = `${route}?${searchParams.toString()}`;
      
      console.log('✅ [NAVIGATION] Encrypted navigation URL generated');
      
      navigate(targetUrl, options);
    } catch (error) {
      console.error('❌ [NAVIGATION] Error during encrypted navigation:', error);
      // Fallback to normal navigation
      navigate(route, options);
    }
  }

  /**
   * Navigate to contractor form with appRefId
   * Angular equivalent: navigateToContractorForm
   */
  static navigateToContractorForm(navigate: NavigateFunction, appRefId: number): void {
    this.navigateWithEncryptedParams(navigate, '/contractor-form', { id: appRefId });
  }

  /**
   * Navigate to supervisor page with appRefId
   * Angular equivalent: navigateToSupervisorDetails
   */
  static navigateToSupervisorDetails(navigate: NavigateFunction, appRefId: number): void {
    this.navigateWithEncryptedParams(navigate, '/contractor-supervisor', { id: appRefId });
  }

  /**
   * Navigate to partner page with appRefId
   * Angular equivalent: navigateToPartnerDetails
   */
  static navigateToPartnerDetails(navigate: NavigateFunction, appRefId: number): void {
    this.navigateWithEncryptedParams(navigate, '/contractor-partner', { id: appRefId });
  }

  /**
   * Navigate to dashboard with encrypted parameters
   * Angular equivalent: navigateToDashboard
   */
  static navigateToDashboard(navigate: NavigateFunction, params?: Record<string, any>): void {
    if (params) {
      this.navigateWithEncryptedParams(navigate, '/dashboard', params);
    } else {
      navigate('/dashboard');
    }
  }

  /**
   * Get decrypted parameters from current URL
   * Angular equivalent: ActivatedRoute param decryption
   */
  static getDecryptedParams(searchParams: URLSearchParams): Record<string, any> | null {
    try {
      const encryptedData = searchParams.get('data');
      
      if (!encryptedData) {
        console.log('📄 [NAVIGATION] No encrypted parameters found');
        return null;
      }

      console.log('🔐 [NAVIGATION] Decrypting URL parameters...');
      const decryptedData = encryptionService.decrypt(encryptedData);
      const parsedData = JSON.parse(decryptedData);
      
      console.log('✅ [NAVIGATION] Decrypted parameters:', parsedData);
      return parsedData;
    } catch (error) {
      console.error('❌ [NAVIGATION] Error decrypting parameters:', error);
      return null;
    }
  }

  /**
   * Navigate back with state preservation
   * Angular equivalent: location.back() with state
   */
  static navigateBack(navigate: NavigateFunction, fallbackRoute: string = '/dashboard'): void {
    try {
      // Try to go back in history
      window.history.back();
      
      // Fallback navigation after a delay
      setTimeout(() => {
        if (window.location.pathname === window.location.pathname) {
          navigate(fallbackRoute);
        }
      }, 100);
    } catch (error) {
      console.error('❌ [NAVIGATION] Error navigating back:', error);
      navigate(fallbackRoute);
    }
  }

  /**
   * Navigate to application submission with success state
   * Angular equivalent: navigateToSubmissionSuccess
   */
  static navigateToSubmissionSuccess(
    navigate: NavigateFunction, 
    appRefId: number, 
    submissionData?: Record<string, any>
  ): void {
    const params = {
      appRefId,
      status: 'submitted',
      timestamp: new Date().toISOString(),
      ...submissionData
    };
    
    this.navigateWithEncryptedParams(navigate, '/submission-success', params);
  }

  /**
   * Check if current route matches expected route pattern
   */
  static isCurrentRoute(pathname: string, expectedRoute: string): boolean {
    return pathname === expectedRoute || pathname.startsWith(`${expectedRoute}/`);
  }

  /**
   * Build encrypted URL for external use (emails, etc.)
   */
  static buildEncryptedUrl(baseUrl: string, route: string, params: Record<string, any>): string {
    try {
      const encryptedData = encryptionService.encrypt(JSON.stringify(params));
      const searchParams = new URLSearchParams();
      searchParams.set('data', encryptedData);
      
      return `${baseUrl}${route}?${searchParams.toString()}`;
    } catch (error) {
      console.error('❌ [NAVIGATION] Error building encrypted URL:', error);
      return `${baseUrl}${route}`;
    }
  }
}
