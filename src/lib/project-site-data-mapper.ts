/**
 * Data mapper for transforming API responses to UI-friendly formats
 * Handles data transformation for various dashboard components
 */

export interface AdminDashboardItem {
  id: string;
  applicationType: string;
  applicationDate: string;
  status: string;
  applicantName: string;
  projectName: string;
  location: string;
}

export interface OfficerDashboardItem {
  id: string;
  applicationType: string;
  applicationDate: string;
  status: string;
  applicantName: string;
  projectName: string;
  location: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
  daysRemaining?: number;
}

export interface LicenseDashboardItem {
  id: string;
  licenseType: string;
  applicationDate: string;
  status: string;
  applicantName: string;
  expiryDate: string;
  renewalRequired: boolean;
}

export class ProjectSiteDataMapper {
  /**
   * Map admin dashboard API response to UI format
   */
  static mapAdminDashboardItem(apiItem: any): AdminDashboardItem {
    return {
      id: apiItem.id || apiItem.applicationId || '',
      applicationType: apiItem.applicationType || apiItem.applicationTypeName || 'N/A',
      applicationDate: apiItem.applicationDate || apiItem.createdDate || new Date().toISOString(),
      status: apiItem.status || apiItem.applicationStatus || 'Pending',
      applicantName: apiItem.applicantName || apiItem.contractorName || 'Unknown',
      projectName: apiItem.projectName || apiItem.projectSiteName || 'N/A',
      location: apiItem.location || apiItem.district || apiItem.address || 'N/A'
    };
  }

  /**
   * Map officer dashboard API response to UI format
   */
  static mapOfficerDashboardItem(apiItem: any): OfficerDashboardItem {
    return {
      id: apiItem.id || apiItem.applicationId || '',
      applicationType: apiItem.applicationType || apiItem.applicationTypeName || 'N/A',
      applicationDate: apiItem.applicationDate || apiItem.createdDate || new Date().toISOString(),
      status: apiItem.status || apiItem.applicationStatus || 'Pending',
      applicantName: apiItem.applicantName || apiItem.contractorName || 'Unknown',
      projectName: apiItem.projectName || apiItem.projectSiteName || 'N/A',
      location: apiItem.location || apiItem.district || apiItem.address || 'N/A',
      priority: this.mapPriority(apiItem.priority || apiItem.priorityLevel),
      assignedTo: apiItem.assignedTo || apiItem.assignedOfficer,
      daysRemaining: this.calculateDaysRemaining(apiItem.dueDate || apiItem.targetDate)
    };
  }

  /**
   * Map license dashboard API response to UI format
   */
  static mapLicenseDashboardItem(apiItem: any): LicenseDashboardItem {
    return {
      id: apiItem.id || apiItem.licenseId || '',
      licenseType: apiItem.licenseType || apiItem.licenseTypeName || 'N/A',
      applicationDate: apiItem.applicationDate || apiItem.issueDate || new Date().toISOString(),
      status: apiItem.status || apiItem.licenseStatus || 'Active',
      applicantName: apiItem.applicantName || apiItem.contractorName || 'Unknown',
      expiryDate: apiItem.expiryDate || apiItem.validUpto || '',
      renewalRequired: this.checkRenewalRequired(apiItem.expiryDate || apiItem.validUpto)
    };
  }

  /**
   * Map contractor dashboard stats
   */
  static mapContractorStats(apiData: any) {
    return {
      projectSiteApplied: apiData.projectSiteApplied || apiData.totalApplications || 0,
      rejected: apiData.rejected || apiData.rejectedCount || 0,
      inbox: apiData.inbox || apiData.pendingCount || 0,
      closed: apiData.closed || apiData.approvedCount || 0,
      draft: apiData.draft || apiData.draftCount || 0
    };
  }

  /**
   * Map project site data for dropdown/selection
   */
  static mapProjectSiteData(apiData: any[]) {
    if (!Array.isArray(apiData)) return [];
    
    return apiData.map(site => ({
      id: site.id || site.projectSiteId,
      name: site.name || site.projectSiteName || site.siteName,
      address: site.address || site.location,
      district: site.district,
      state: site.state,
      pincode: site.pincode,
      status: site.status || 'Active',
      applicationType: site.applicationType || site.applicationTypeName
    }));
  }

  /**
   * Map notification data
   */
  static mapNotificationData(apiData: any[]) {
    if (!Array.isArray(apiData)) return [];
    
    return apiData.map(notification => ({
      id: notification.id,
      title: notification.title || notification.subject,
      message: notification.message || notification.body,
      type: notification.type || notification.notificationType || 'info',
      isRead: notification.isRead || false,
      createdDate: notification.createdDate || new Date().toISOString(),
      priority: this.mapPriority(notification.priority)
    }));
  }

  /**
   * Map application form data
   */
  static mapApplicationFormData(apiData: any) {
    return {
      applicantDetails: {
        id: apiData.applicantId || apiData.contractorId,
        name: apiData.applicantName || apiData.contractorName,
        email: apiData.email,
        phone: apiData.phoneNumber || apiData.mobileNumber,
        address: apiData.address,
        panNumber: apiData.panNumber,
        gstNumber: apiData.gstNumber,
        licenseNumber: apiData.licenseNumber
      },
      projectDetails: {
        id: apiData.projectId || apiData.projectSiteId,
        name: apiData.projectName || apiData.projectSiteName,
        address: apiData.projectAddress,
        district: apiData.district,
        voltage: apiData.voltage || apiData.voltageLevel,
        capacity: apiData.capacity || apiData.sanctionedLoad,
        applicationtype: apiData.applicationType
      },
      documents: this.mapDocuments(apiData.documents || []),
      workingAreas: this.mapWorkingAreas(apiData.workingAreas || []),
      supervisors: this.mapSupervisors(apiData.supervisors || [])
    };
  }

  // Helper methods
  private static mapPriority(priority?: string | number): 'high' | 'medium' | 'low' {
    if (!priority) return 'medium';
    
    const priorityStr = priority.toString().toLowerCase();
    if (priorityStr.includes('high') || priorityStr === '1' || priorityStr === 'urgent') {
      return 'high';
    }
    if (priorityStr.includes('low') || priorityStr === '3') {
      return 'low';
    }
    return 'medium';
  }

  private static calculateDaysRemaining(dueDate?: string): number | undefined {
    if (!dueDate) return undefined;
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  private static checkRenewalRequired(expiryDate?: string): boolean {
    if (!expiryDate) return false;
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Renewal required if expiring within 30 days
    return diffDays <= 30;
  }

  private static mapDocuments(documents: any[]) {
    return documents.map(doc => ({
      id: doc.id,
      name: doc.name || doc.fileName,
      type: doc.type || doc.documentType,
      url: doc.url || doc.filePath,
      uploadDate: doc.uploadDate || doc.createdDate,
      status: doc.status || 'Uploaded'
    }));
  }

  private static mapWorkingAreas(workingAreas: any[]) {
    return workingAreas.map(area => ({
      id: area.id,
      description: area.description || area.workingAreaDescription,
      voltage: area.voltage || area.voltageLevel,
      capacity: area.capacity,
      district: area.district,
      status: area.status || 'Active'
    }));
  }

  private static mapSupervisors(supervisors: any[]) {
    return supervisors.map(supervisor => ({
      id: supervisor.id,
      name: supervisor.name || supervisor.supervisorName,
      licenseNumber: supervisor.licenseNumber,
      category: supervisor.category,
      validUpto: supervisor.validUpto || supervisor.expiryDate,
      status: supervisor.status || 'Active'
    }));
  }
}