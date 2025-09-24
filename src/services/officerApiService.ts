import { axiosInterceptor } from '../lib/interceptor';

export interface OfficerDashboardParams {
  userId: string;
  dashboardNameType: string;
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface AgendaParams {
  userId: string;
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ProcessApplicationParams {
  applicationId: string;
  action: string;
  remarks?: string;
  assignedTo?: string;
}

export class OfficerApiService {
  
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
   * Get officer dashboard data
   */
  async getOfficerDashboardData(params: OfficerDashboardParams): Promise<any> {
    try {
      const response = await this.httpGet(params, 'Officer', 'getOfficerDashBoardDetails');
      return response;
    } catch (error) {
      console.error('Error fetching officer dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get agenda data for officer
   */
  async getAgendaData(params: AgendaParams): Promise<any> {
    try {
      const response = await this.httpGet(params, 'Officer', 'getAgendaData');
      return response;
    } catch (error) {
      console.error('Error fetching agenda data:', error);
      throw error;
    }
  }

  /**
   * Get application details for processing
   */
  async getApplicationDetails(applicationId: string): Promise<any> {
    try {
      const params = { id: applicationId };
      const response = await this.httpGet(params, 'Officer', 'getApplicationDetails');
      return response;
    } catch (error) {
      console.error('Error fetching application details:', error);
      throw error;
    }
  }

  /**
   * Process application (approve/reject/assign)
   */
  async processApplication(params: ProcessApplicationParams): Promise<any> {
    try {
      const response = await this.httpPost(params, 'Officer', 'processApplication');
      return response;
    } catch (error) {
      console.error('Error processing application:', error);
      throw error;
    }
  }

  /**
   * Approve application
   */
  async approveApplication(applicationId: string, remarks?: string): Promise<any> {
    try {
      const payload = { applicationId, action: 'approve', remarks };
      const response = await this.httpPost(payload, 'Officer', 'approveApplication');
      return response;
    } catch (error) {
      console.error('Error approving application:', error);
      throw error;
    }
  }

  /**
   * Reject application
   */
  async rejectApplication(applicationId: string, remarks: string): Promise<any> {
    try {
      const payload = { applicationId, action: 'reject', remarks };
      const response = await this.httpPost(payload, 'Officer', 'rejectApplication');
      return response;
    } catch (error) {
      console.error('Error rejecting application:', error);
      throw error;
    }
  }

  /**
   * Assign application to another officer
   */
  async assignApplication(applicationId: string, assignedTo: string, remarks?: string): Promise<any> {
    try {
      const payload = { applicationId, assignedTo, remarks };
      const response = await this.httpPost(payload, 'Officer', 'assignApplication');
      return response;
    } catch (error) {
      console.error('Error assigning application:', error);
      throw error;
    }
  }

  /**
   * Get workload statistics for officer
   */
  async getWorkloadStatistics(userId: string): Promise<any> {
    try {
      const params = { userId };
      const response = await this.httpGet(params, 'Officer', 'getWorkloadStatistics');
      return response;
    } catch (error) {
      console.error('Error fetching workload statistics:', error);
      throw error;
    }
  }

  /**
   * Add comments to application
   */
  async addApplicationComment(applicationId: string, comment: string): Promise<any> {
    try {
      const payload = { applicationId, comment };
      const response = await this.httpPost(payload, 'Officer', 'addApplicationComment');
      return response;
    } catch (error) {
      console.error('Error adding application comment:', error);
      throw error;
    }
  }

  /**
   * Get application comments
   */
  async getApplicationComments(applicationId: string): Promise<any> {
    try {
      const params = { applicationId };
      const response = await this.httpGet(params, 'Officer', 'getApplicationComments');
      return response;
    } catch (error) {
      console.error('Error fetching application comments:', error);
      throw error;
    }
  }

  /**
   * Update application priority
   */
  async updateApplicationPriority(applicationId: string, priority: 'high' | 'medium' | 'low'): Promise<any> {
    try {
      const payload = { applicationId, priority };
      const response = await this.httpPost(payload, 'Officer', 'updateApplicationPriority');
      return response;
    } catch (error) {
      console.error('Error updating application priority:', error);
      throw error;
    }
  }

  /**
   * Get processing history
   */
  async getProcessingHistory(applicationId: string): Promise<any> {
    try {
      const params = { applicationId };
      const response = await this.httpGet(params, 'Officer', 'getProcessingHistory');
      return response;
    } catch (error) {
      console.error('Error fetching processing history:', error);
      throw error;
    }
  }

  /**
   * Generate application report
   */
  async generateApplicationReport(reportParams: {
    fromDate: string;
    toDate: string;
    status?: string;
    applicationType?: string;
    format: 'pdf' | 'excel';
  }): Promise<any> {
    try {
      const response = await this.httpPost(reportParams, 'Officer', 'generateApplicationReport');
      return response;
    } catch (error) {
      console.error('Error generating application report:', error);
      throw error;
    }
  }

  /**
   * Bulk process applications
   */
  async bulkProcessApplications(applicationIds: string[], action: string, remarks?: string): Promise<any> {
    try {
      const payload = { applicationIds, action, remarks };
      const response = await this.httpPost(payload, 'Officer', 'bulkProcessApplications');
      return response;
    } catch (error) {
      console.error('Error bulk processing applications:', error);
      throw error;
    }
  }
}

export const officerApiService = new OfficerApiService();