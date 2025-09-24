import { axiosInterceptor } from '../lib/interceptor';

export interface AdminDashboardParams {
  dashboardNameType: string;
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface VerifyPaymentsParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  status?: string;
}

export interface UserManagementParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  role?: string;
  status?: string;
}

export class AdminApiService {
  
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
   * Get admin dashboard details
   */
  async getAdminDashboardDetails(params: AdminDashboardParams): Promise<any> {
    try {
      const response = await this.httpGet(params, 'Admin', 'getAdminDashBoardDetails');
      return response;
    } catch (error) {
      console.error('Error fetching admin dashboard details:', error);
      throw error;
    }
  }

  /**
   * Get system statistics for admin
   */
  async getSystemStatistics(): Promise<any> {
    try {
      const response = await this.httpGet({}, 'Admin', 'getSystemStatistics');
      return response;
    } catch (error) {
      console.error('Error fetching system statistics:', error);
      throw error;
    }
  }

  /**
   * Get user management data
   */
  async getUserManagementData(params: UserManagementParams): Promise<any> {
    try {
      const response = await this.httpGet(params, 'Admin', 'getUserManagementData');
      return response;
    } catch (error) {
      console.error('Error fetching user management data:', error);
      throw error;
    }
  }

  /**
   * Lock/Unlock user account
   */
  async toggleUserAccountStatus(userId: string, action: 'lock' | 'unlock'): Promise<any> {
    try {
      const payload = { userId, action };
      const response = await this.httpPost(payload, 'Admin', 'toggleUserAccountStatus');
      return response;
    } catch (error) {
      console.error('Error toggling user account status:', error);
      throw error;
    }
  }

  /**
   * Get payment verification data
   */
  async getVerifyPaymentsData(params: VerifyPaymentsParams): Promise<any> {
    try {
      const response = await this.httpGet(params, 'Admin', 'getVerifyPaymentsData');
      return response;
    } catch (error) {
      console.error('Error fetching payment verification data:', error);
      throw error;
    }
  }

  /**
   * Verify payment transaction
   */
  async verifyPaymentTransaction(transactionId: string, status: 'approved' | 'rejected', remarks?: string): Promise<any> {
    try {
      const payload = { transactionId, status, remarks };
      const response = await this.httpPost(payload, 'Admin', 'verifyPaymentTransaction');
      return response;
    } catch (error) {
      console.error('Error verifying payment transaction:', error);
      throw error;
    }
  }

  /**
   * Get reports data
   */
  async getReportsData(reportType: string, params: any): Promise<any> {
    try {
      const response = await this.httpGet({ ...params, reportType }, 'Admin', 'getReportsData');
      return response;
    } catch (error) {
      console.error('Error fetching reports data:', error);
      throw error;
    }
  }

  /**
   * Get activity logs
   */
  async getActivityLogs(params: { 
    pageNumber: number; 
    pageSize: number; 
    userId?: string; 
    action?: string; 
    fromDate?: string; 
    toDate?: string; 
  }): Promise<any> {
    try {
      const response = await this.httpGet(params, 'Admin', 'getActivityLogs');
      return response;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  }

  /**
   * Get error logs
   */
  async getErrorLogs(params: { 
    pageNumber: number; 
    pageSize: number; 
    severity?: string; 
    fromDate?: string; 
    toDate?: string; 
  }): Promise<any> {
    try {
      const response = await this.httpGet(params, 'Admin', 'getErrorLogs');
      return response;
    } catch (error) {
      console.error('Error fetching error logs:', error);
      throw error;
    }
  }

  /**
   * Update system configuration
   */
  async updateSystemConfiguration(configData: any): Promise<any> {
    try {
      const response = await this.httpPost(configData, 'Admin', 'updateSystemConfiguration');
      return response;
    } catch (error) {
      console.error('Error updating system configuration:', error);
      throw error;
    }
  }

  /**
   * Get system configuration
   */
  async getSystemConfiguration(): Promise<any> {
    try {
      const response = await this.httpGet({}, 'Admin', 'getSystemConfiguration');
      return response;
    } catch (error) {
      console.error('Error fetching system configuration:', error);
      throw error;
    }
  }

  /**
   * Generate system backup
   */
  async generateSystemBackup(backupType: 'full' | 'incremental'): Promise<any> {
    try {
      const payload = { backupType };
      const response = await this.httpPost(payload, 'Admin', 'generateSystemBackup');
      return response;
    } catch (error) {
      console.error('Error generating system backup:', error);
      throw error;
    }
  }

  /**
   * Get backup history
   */
  async getBackupHistory(): Promise<any> {
    try {
      const response = await this.httpGet({}, 'Admin', 'getBackupHistory');
      return response;
    } catch (error) {
      console.error('Error fetching backup history:', error);
      throw error;
    }
  }

  /**
   * Restore system from backup
   */
  async restoreSystemBackup(backupId: string): Promise<any> {
    try {
      const payload = { backupId };
      const response = await this.httpPost(payload, 'Admin', 'restoreSystemBackup');
      return response;
    } catch (error) {
      console.error('Error restoring system backup:', error);
      throw error;
    }
  }

  /**
   * Send system notification
   */
  async sendSystemNotification(notificationData: {
    title: string;
    message: string;
    recipientType: 'all' | 'role' | 'user';
    recipients?: string[];
    priority: 'low' | 'medium' | 'high';
  }): Promise<any> {
    try {
      const response = await this.httpPost(notificationData, 'Admin', 'sendSystemNotification');
      return response;
    } catch (error) {
      console.error('Error sending system notification:', error);
      throw error;
    }
  }

  /**
   * Get department statistics
   */
  async getDepartmentStatistics(): Promise<any> {
    try {
      const response = await this.httpGet({}, 'Admin', 'getDepartmentStatistics');
      return response;
    } catch (error) {
      console.error('Error fetching department statistics:', error);
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, newRole: string): Promise<any> {
    try {
      const payload = { userId, newRole };
      const response = await this.httpPost(payload, 'Admin', 'updateUserRole');
      return response;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Reset user password
   */
  async resetUserPassword(userId: string, sendEmail: boolean = true): Promise<any> {
    try {
      const payload = { userId, sendEmail };
      const response = await this.httpPost(payload, 'Admin', 'resetUserPassword');
      return response;
    } catch (error) {
      console.error('Error resetting user password:', error);
      throw error;
    }
  }

  /**
   * Get user details by email or phone number
   */
  async getUserDetailsByEmailOrPhone(params: { email?: string; phoneNo?: string }): Promise<any> {
    try {
      console.log('🔍 [ADMIN-API-SERVICE] Fetching user details:', params);
      const response = await this.httpGet(params, 'UserDetails', 'getUserDetails_ByEmailPhone');
      
      return {
        success: true,
        data: response,
        message: 'User details retrieved successfully'
      };
    } catch (error) {
      console.error('❌ [ADMIN-API-SERVICE] Error fetching user details:', error);
      throw error;
    }
  }

  /**
   * Get receivers list by role for forwarding applications
   */
  async getReceiversByRole(roleName: string): Promise<any> {
    try {
      console.log('🔍 [ADMIN-API-SERVICE] Fetching receivers for role:', roleName);
      const response = await this.httpGet({ roleName }, 'Admin', 'getReceiversByRole');
      
      return {
        success: true,
        data: response,
        message: 'Receivers retrieved successfully'
      };
    } catch (error) {
      console.error('❌ [ADMIN-API-SERVICE] Error fetching receivers:', error);
      throw error;
    }
  }

  /**
   * Get application processing history
   */
  async getApplicationProcessingHistory(appId: number): Promise<any> {
    try {
      console.log('🔍 [ADMIN-API-SERVICE] Fetching processing history for app:', appId);
      const response = await this.httpGet({ appId }, 'Application', 'getProcessingHistory');
      
      return {
        success: true,
        data: response,
        message: 'Processing history retrieved successfully'
      };
    } catch (error) {
      console.error('❌ [ADMIN-API-SERVICE] Error fetching processing history:', error);
      throw error;
    }
  }

  /**
   * Process application with specified action
   */
  async processApplication(payload: any): Promise<any> {
    try {
      console.log('🔄 [ADMIN-API-SERVICE] Processing application:', payload);
      const response = await this.httpPost(payload, 'Application', 'processApplication');
      
      return {
        success: true,
        data: response,
        message: 'Application processed successfully'
      };
    } catch (error) {
      console.error('❌ [ADMIN-API-SERVICE] Error processing application:', error);
      throw error;
    }
  }

  /**
   * Get application details by ID and type
   */
  async getApplicationDetails(data: {
    appRefId: number;
    applicationType: number;
    projectSiteId?: number;
    applicationPurposeType?: number;
  }): Promise<any> {
    try {
      console.log('🔍 [ADMIN-API-SERVICE] Fetching application details:', data);
      
      const response = await this.httpGet({
        appRefId: data.appRefId,
        applicationType: data.applicationType,
        projectSiteId: data.projectSiteId || 0,
        applicationPurposeType: data.applicationPurposeType || 1
      }, 'Application', 'getApplicationDetails');
      
      return {
        success: true,
        data: response,
        message: 'Application details retrieved successfully'
      };
    } catch (error) {
      console.error('❌ [ADMIN-API-SERVICE] Error fetching application details:', error);
      throw error;
    }
  }
}

// Export service instance
export const adminApiService = new AdminApiService();