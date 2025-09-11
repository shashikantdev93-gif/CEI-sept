import { userDetailsService } from '../services/api/userDetailsService';
import type { SupervisorData, WiremanData } from '../types/supervisor.types';

export interface ExpiryCheckResult {
  isExpired: boolean;
  isExpiringSoon: boolean; // Within 30 days
  daysUntilExpiry: number;
  expiryDate: Date | null;
  warningMessage?: string;
}

export interface BulkExpiryResult {
  expired: Array<SupervisorData | WiremanData>;
  expiringSoon: Array<SupervisorData | WiremanData>;
  totalChecked: number;
  hasIssues: boolean;
}

/**
 * Enhanced certificate expiry validation service
 * Provides comprehensive expiry checking and validation
 */
export class CertificateExpiryService {
  
  private static readonly EXPIRY_WARNING_DAYS = 30;

  /**
   * Check if a certificate is expired or expiring soon
   */
  static checkCertificateExpiry(licenceValidUpto: string): ExpiryCheckResult {
    try {
      if (!licenceValidUpto) {
        return {
          isExpired: true,
          isExpiringSoon: false,
          daysUntilExpiry: -1,
          expiryDate: null,
          warningMessage: 'No expiry date provided'
        };
      }

      const expiryDate = new Date(licenceValidUpto);
      const now = new Date();
      const timeDiff = expiryDate.getTime() - now.getTime();
      const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

      const isExpired = daysUntilExpiry < 0;
      const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= this.EXPIRY_WARNING_DAYS;

      let warningMessage: string | undefined;
      if (isExpired) {
        warningMessage = `Certificate expired ${Math.abs(daysUntilExpiry)} days ago`;
      } else if (isExpiringSoon) {
        warningMessage = `Certificate expires in ${daysUntilExpiry} days`;
      }

      return {
        isExpired,
        isExpiringSoon,
        daysUntilExpiry,
        expiryDate,
        warningMessage
      };
    } catch (error) {
      console.error('❌ [EXPIRY-SERVICE] Error checking certificate expiry:', error);
      return {
        isExpired: true,
        isExpiringSoon: false,
        daysUntilExpiry: -1,
        expiryDate: null,
        warningMessage: 'Invalid expiry date format'
      };
    }
  }

  /**
   * Check expiry status for a list of supervisors
   */
  static checkSupervisorListExpiry(supervisors: SupervisorData[]): BulkExpiryResult {
    const expired: SupervisorData[] = [];
    const expiringSoon: SupervisorData[] = [];

    supervisors.forEach(supervisor => {
      const expiryCheck = this.checkCertificateExpiry(supervisor.licenceValidUpto);
      
      if (expiryCheck.isExpired) {
        expired.push({ ...supervisor, licenceExpired: true });
      } else if (expiryCheck.isExpiringSoon) {
        expiringSoon.push({ ...supervisor, licenceExpired: false });
      }
    });

    return {
      expired,
      expiringSoon,
      totalChecked: supervisors.length,
      hasIssues: expired.length > 0 || expiringSoon.length > 0
    };
  }

  /**
   * Check expiry status for a list of wiremans
   */
  static checkWiremanListExpiry(wiremans: WiremanData[]): BulkExpiryResult {
    const expired: WiremanData[] = [];
    const expiringSoon: WiremanData[] = [];

    wiremans.forEach(wireman => {
      const expiryCheck = this.checkCertificateExpiry(wireman.licenceValidUpto);
      
      if (expiryCheck.isExpired) {
        expired.push({ ...wireman, licenceExpired: true });
      } else if (expiryCheck.isExpiringSoon) {
        expiringSoon.push({ ...wireman, licenceExpired: false });
      }
    });

    return {
      expired,
      expiringSoon,
      totalChecked: wiremans.length,
      hasIssues: expired.length > 0 || expiringSoon.length > 0
    };
  }

  /**
   * Validate certificate number and check expiry in one call
   * Angular equivalent: combined validation logic
   */
  static async validateSupervisorWithExpiry(licenceNo: string): Promise<{
    isValid: boolean;
    expiryCheck: ExpiryCheckResult;
    supervisorData?: any;
    error?: string;
  }> {
    try {
      console.log('🔍 [EXPIRY-SERVICE] Validating supervisor with expiry:', licenceNo);
      
      // Call API to validate licence
      const response = await userDetailsService.getSupervisorDetails_ByLicenceNo(licenceNo);
      
      if (!response?.data || !response.success) {
        return {
          isValid: false,
          expiryCheck: {
            isExpired: true,
            isExpiringSoon: false,
            daysUntilExpiry: -1,
            expiryDate: null,
            warningMessage: 'Invalid certificate number'
          },
          error: 'Certificate not found or invalid'
        };
      }

      const supervisorData = response.data;
      
      // Extract licence validity from API response structure
      const licenceValidUpto = supervisorData?.formModel?.[0]?.licenceValidOnUpToDate;
      if (!licenceValidUpto) {
        return {
          isValid: false,
          expiryCheck: {
            isExpired: true,
            isExpiringSoon: false,
            daysUntilExpiry: -1,
            expiryDate: null,
            warningMessage: 'No expiry date found'
          },
          error: 'Certificate validity date not available'
        };
      }
      
      const expiryCheck = this.checkCertificateExpiry(licenceValidUpto);

      return {
        isValid: true,
        expiryCheck,
        supervisorData,
        error: expiryCheck.warningMessage
      };
    } catch (error) {
      console.error('❌ [EXPIRY-SERVICE] Error validating supervisor with expiry:', error);
      return {
        isValid: false,
        expiryCheck: {
          isExpired: true,
          isExpiringSoon: false,
          daysUntilExpiry: -1,
          expiryDate: null,
          warningMessage: 'Validation failed'
        },
        error: 'Network error during validation'
      };
    }
  }

  /**
   * Validate wireman certificate number and check expiry
   * Angular equivalent: combined validation logic
   */
  static async validateWiremanWithExpiry(licenceNo: string): Promise<{
    isValid: boolean;
    expiryCheck: ExpiryCheckResult;
    wiremanData?: any;
    error?: string;
  }> {
    try {
      console.log('🔍 [EXPIRY-SERVICE] Validating wireman with expiry:', licenceNo);
      
      // Call API to validate licence
      const response = await userDetailsService.getWiremanDetails_ByLicenceNo(licenceNo);
      
      if (!response?.data || !response.success) {
        return {
          isValid: false,
          expiryCheck: {
            isExpired: true,
            isExpiringSoon: false,
            daysUntilExpiry: -1,
            expiryDate: null,
            warningMessage: 'Invalid certificate number'
          },
          error: 'Certificate not found or invalid'
        };
      }

      const wiremanData = response.data;
      
      // Extract licence validity from API response structure  
      const licenceValidUpto = wiremanData?.formModel?.[0]?.licenceValidOnUpToDate;
      if (!licenceValidUpto) {
        return {
          isValid: false,
          expiryCheck: {
            isExpired: true,
            isExpiringSoon: false,
            daysUntilExpiry: -1,
            expiryDate: null,
            warningMessage: 'No expiry date found'
          },
          error: 'Certificate validity date not available'
        };
      }
      
      const expiryCheck = this.checkCertificateExpiry(licenceValidUpto);

      return {
        isValid: true,
        expiryCheck,
        wiremanData,
        error: expiryCheck.warningMessage
      };
    } catch (error) {
      console.error('❌ [EXPIRY-SERVICE] Error validating wireman with expiry:', error);
      return {
        isValid: false,
        expiryCheck: {
          isExpired: true,
          isExpiringSoon: false,
          daysUntilExpiry: -1,
          expiryDate: null,
          warningMessage: 'Validation failed'
        },
        error: 'Network error during validation'
      };
    }
  }

  /**
   * Format expiry date for display
   */
  static formatExpiryDate(licenceValidUpto: string): string {
    try {
      if (!licenceValidUpto) return 'No expiry date';
      
      const date = new Date(licenceValidUpto);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  }

  /**
   * Get expiry status badge class for UI
   */
  static getExpiryBadgeClass(licenceValidUpto: string): string {
    const expiryCheck = this.checkCertificateExpiry(licenceValidUpto);
    
    if (expiryCheck.isExpired) {
      return 'badge bg-danger';
    } else if (expiryCheck.isExpiringSoon) {
      return 'badge bg-warning text-dark';
    } else {
      return 'badge bg-success';
    }
  }

  /**
   * Get expiry status text for UI
   */
  static getExpiryStatusText(licenceValidUpto: string): string {
    const expiryCheck = this.checkCertificateExpiry(licenceValidUpto);
    
    if (expiryCheck.isExpired) {
      return 'Expired';
    } else if (expiryCheck.isExpiringSoon) {
      return 'Expiring Soon';
    } else {
      return 'Valid';
    }
  }
}
