import { axiosInterceptor } from '../lib/interceptor';

export interface DashboardCountParams {
  UserId: string;
  role: string;
}

export class CommonApiService {
  
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
   * Get dashboard count data by role
   */
  async getDashboardCountDataByRole(userId: string, role: string): Promise<any> {
    try {
      const params = { UserId: userId, role };
      const response = await this.httpGet(params, 'CommonApis', 'getDashBoardCountDataBy_Role');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard count data:', error);
      throw error;
    }
  }

  /**
   * Get project site data
   */
  async getProjectSiteData(userId: string): Promise<any> {
    try {
      const params = { UserId: userId };
      const response = await this.httpGet(params, 'ProjectSites', 'getProjectSiteData');
      return response;
    } catch (error) {
      console.error('Error fetching project site data:', error);
      throw error;
    }
  }

  /**
   * Get application details by ID
   */
  async getApplicationDetailsById(appId: string): Promise<any> {
    try {
      const params = { id: appId };
      const response = await this.httpGet(params, 'Applications', 'getApplicationDetails');
      return response;
    } catch (error) {
      console.error('Error fetching application details:', error);
      throw error;
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(appId: string, status: string, remarks?: string): Promise<any> {
    try {
      const payload = { appId, status, remarks };
      const response = await this.httpPost(payload, 'Applications', 'updateStatus');
      return response;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  /**
   * Get notifications for user
   */
  async getUserNotifications(userId: string): Promise<any> {
    try {
      const params = { userId };
      const response = await this.httpGet(params, 'CommonApis', 'getUserNotifications');
      return response;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<any> {
    try {
      const payload = { notificationId };
      const response = await this.httpPost(payload, 'CommonApis', 'markNotificationAsRead');
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(emailData: {
    to: string;
    subject: string;
    body: string;
    attachments?: any[];
  }): Promise<any> {
    try {
      const response = await this.httpPost(emailData, 'CommonApis', 'sendEmailNotification');
      return response;
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  }

  /**
   * Get system configuration
   */
  async getSystemConfig(configKey?: string): Promise<any> {
    try {
      const params = configKey ? { key: configKey } : {};
      const response = await this.httpGet(params, 'CommonApis', 'getSystemConfig');
      return response;
    } catch (error) {
      console.error('Error fetching system config:', error);
      throw error;
    }
  }

  /**
   * Log user activity
   */
  async logUserActivity(activityData: {
    userId: string;
    action: string;
    description: string;
    ipAddress?: string;
  }): Promise<any> {
    try {
      const response = await this.httpPost(activityData, 'CommonApis', 'logUserActivity');
      return response;
    } catch (error) {
      console.error('Error logging user activity:', error);
      throw error;
    }
  }
}

export const commonApiService = new CommonApiService();