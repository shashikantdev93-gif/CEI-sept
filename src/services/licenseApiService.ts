import { axiosInterceptor } from '../lib/interceptor';

export interface LicenseDashboardParams {
  userId: string;
  dashboardNameType: string;
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface LicenseApplicationParams {
  applicantId: string;
  licenseType: string;
  contractorCategory: string;
  documents: any[];
}

export interface LicenseRenewalParams {
  licenseId: string;
  renewalType: string;
  documents?: any[];
}

export class LicenseApiService {
  
  private async httpGet(params: any, controller: string, action: string): Promise<any> {
    const endpoint = `/${controller}/${action}`;
    const response = await axiosInterceptor.get(endpoint, { params });
    return response.data;
  }

  private async httpPost(payload: any, controller: string, action: string): Promise<any> {
    const endpoint = `/${controller}/${action}`;
    const response = await axiosInterceptor.post(endpoint, payload);
    return response.data;
  }

  /**
   * Get license dashboard counts
   */
  async getLicenseDashboardCounts(userId: string): Promise<any> {
    try {
      const params = { userId };
      const response = await this.httpGet(params, 'License', 'getLicenseDashboardCounts');
      return response;
    } catch (error) {
      console.error('Error fetching license dashboard counts:', error);
      throw error;
    }
  }

  /**
   * Get license dashboard data
   */
  async getLicenseDashboardData(params: LicenseDashboardParams): Promise<any> {
    try {
      const response = await this.httpGet(params, 'License', 'getLicenseDashboardData');
      return response;
    } catch (error) {
      console.error('Error fetching license dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get license details by ID
   */
  async getLicenseDetails(licenseId: string): Promise<any> {
    try {
      const params = { id: licenseId };
      const response = await this.httpGet(params, 'License', 'getLicenseDetails');
      return response;
    } catch (error) {
      console.error('Error fetching license details:', error);
      throw error;
    }
  }

  /**
   * Create new license application
   */
  async createLicenseApplication(applicationData: LicenseApplicationParams): Promise<any> {
    try {
      const response = await this.httpPost(applicationData, 'License', 'createLicenseApplication');
      return response;
    } catch (error) {
      console.error('Error creating license application:', error);
      throw error;
    }
  }

  /**
   * Approve license application
   */
  async approveLicenseApplication(licenseId: string, remarks?: string): Promise<any> {
    try {
      const payload = { licenseId, action: 'approve', remarks };
      const response = await this.httpPost(payload, 'License', 'approveLicenseApplication');
      return response;
    } catch (error) {
      console.error('Error approving license application:', error);
      throw error;
    }
  }

  /**
   * Reject license application
   */
  async rejectLicenseApplication(licenseId: string, remarks: string): Promise<any> {
    try {
      const payload = { licenseId, action: 'reject', remarks };
      const response = await this.httpPost(payload, 'License', 'rejectLicenseApplication');
      return response;
    } catch (error) {
      console.error('Error rejecting license application:', error);
      throw error;
    }
  }

  /**
   * Process license renewal
   */
  async processLicenseRenewal(licenseId: string, action: 'approved' | 'rejected', remarks?: string): Promise<any> {
    try {
      const payload = { licenseId, action, remarks };
      const response = await this.httpPost(payload, 'License', 'processLicenseRenewal');
      return response;
    } catch (error) {
      console.error('Error processing license renewal:', error);
      throw error;
    }
  }

  /**
   * Submit license renewal application
   */
  async submitLicenseRenewal(renewalData: LicenseRenewalParams): Promise<any> {
    try {
      const response = await this.httpPost(renewalData, 'License', 'submitLicenseRenewal');
      return response;
    } catch (error) {
      console.error('Error submitting license renewal:', error);
      throw error;
    }
  }

  /**
   * Get license types
   */
  async getLicenseTypes(): Promise<any> {
    try {
      const response = await this.httpGet({}, 'License', 'getLicenseTypes');
      return response;
    } catch (error) {
      console.error('Error fetching license types:', error);
      throw error;
    }
  }

  /**
   * Get contractor categories
   */
  async getContractorCategories(): Promise<any> {
    try {
      const response = await this.httpGet({}, 'License', 'getContractorCategories');
      return response;
    } catch (error) {
      console.error('Error fetching contractor categories:', error);
      throw error;
    }
  }

  /**
   * Suspend license
   */
  async suspendLicense(licenseId: string, reason: string): Promise<any> {
    try {
      const payload = { licenseId, reason, action: 'suspend' };
      const response = await this.httpPost(payload, 'License', 'suspendLicense');
      return response;
    } catch (error) {
      console.error('Error suspending license:', error);
      throw error;
    }
  }

  /**
   * Reactivate license
   */
  async reactivateLicense(licenseId: string, remarks?: string): Promise<any> {
    try {
      const payload = { licenseId, remarks, action: 'reactivate' };
      const response = await this.httpPost(payload, 'License', 'reactivateLicense');
      return response;
    } catch (error) {
      console.error('Error reactivating license:', error);
      throw error;
    }
  }

  /**
   * Get license history
   */
  async getLicenseHistory(licenseId: string): Promise<any> {
    try {
      const params = { licenseId };
      const response = await this.httpGet(params, 'License', 'getLicenseHistory');
      return response;
    } catch (error) {
      console.error('Error fetching license history:', error);
      throw error;
    }
  }

  /**
   * Generate license certificate
   */
  async generateLicenseCertificate(licenseId: string, format: 'pdf' | 'jpg'): Promise<any> {
    try {
      const payload = { licenseId, format };
      const response = await this.httpPost(payload, 'License', 'generateLicenseCertificate');
      return response;
    } catch (error) {
      console.error('Error generating license certificate:', error);
      throw error;
    }
  }

  /**
   * Get expired licenses report
   */
  async getExpiredLicensesReport(fromDate: string, toDate: string): Promise<any> {
    try {
      const params = { fromDate, toDate };
      const response = await this.httpGet(params, 'License', 'getExpiredLicensesReport');
      return response;
    } catch (error) {
      console.error('Error fetching expired licenses report:', error);
      throw error;
    }
  }

  /**
   * Get renewal notifications
   */
  async getRenewalNotifications(daysBeforeExpiry: number = 30): Promise<any> {
    try {
      const params = { daysBeforeExpiry };
      const response = await this.httpGet(params, 'License', 'getRenewalNotifications');
      return response;
    } catch (error) {
      console.error('Error fetching renewal notifications:', error);
      throw error;
    }
  }

  /**
   * Send renewal reminders
   */
  async sendRenewalReminders(licenseIds: string[]): Promise<any> {
    try {
      const payload = { licenseIds };
      const response = await this.httpPost(payload, 'License', 'sendRenewalReminders');
      return response;
    } catch (error) {
      console.error('Error sending renewal reminders:', error);
      throw error;
    }
  }

  /**
   * Validate license number
   */
  async validateLicenseNumber(licenseNumber: string): Promise<any> {
    try {
      const params = { licenseNumber };
      const response = await this.httpGet(params, 'License', 'validateLicenseNumber');
      return response;
    } catch (error) {
      console.error('Error validating license number:', error);
      throw error;
    }
  }

  /**
   * Get license statistics
   */
  async getLicenseStatistics(fromDate: string, toDate: string): Promise<any> {
    try {
      const params = { fromDate, toDate };
      const response = await this.httpGet(params, 'License', 'getLicenseStatistics');
      return response;
    } catch (error) {
      console.error('Error fetching license statistics:', error);
      throw error;
    }
  }
}

export const licenseApiService = new LicenseApiService();