import React from 'react'; // Add React import for React.ReactNode

interface ProjectSiteData {
  projectSiteId?: number;
  projectSiteApplicationType?: number;
  state?: number;
  villageOrTown?: string;
  address1?: string;
  address2?: string;
  createdOnDate?: string;
  pinCode?: number;
  applicantPanNumber?: string;
  users?: {
    userName?: string;
    userProfileMapping?: {
      userProfile?: {
        firstName?: string;
        lastName?: string;
        mobileNo?: string;
        email?: string;
        commuAddress1?: string;
        commuAddress2?: string;
      }
    }
  };
  applications?: any[];
}

// Dashboard table row interface
export interface DashboardTableRowData { // Export interface
  "S.No.": number;
  "PIN": string;
  "Application No": string;
  "Site Address": string;
  "Applicant Name": string;
  "Mobile": string;
  "Communication Address": string;
  "Project Purpose": string;
  "Action": string;
}

// Project details field interface
export interface ProjectDetailsField { // Export interface
  label: string;
  value: React.ReactNode; 
  isHighlighted?: boolean;
}

// Application data interface
export interface ApplicationData { // Export interface
  id: string;
  applicationId: string;
  applicationName: string;
  submittedOn: string;
  currentStatus: string;
  updatedOn: string;
  action: string;
  paymentStatus: string;
  // Additional backend data for action handlers
  backendAppId?: number;
  applicationType?: number;
  applicationPurposeType?: number;
  applicationLifeCycleStatusType?: number;
  appActionType?: number;
}

// DetailsField interface for compatibility (remove duplicate export)
export interface DetailsField {
  label: string;
  value: React.ReactNode;
  isHighlighted?: boolean;
}

export class ProjectSiteDataMapper {
  
  // Common utility methods
  static getProjectPurpose(applicationType?: number): string {
    switch (applicationType) {
      case 1: return 'Wireman';
      case 2: return 'Supervisor / Contractor';
      case 3: return 'Other';
      default: return 'N/A';
    }
  }

  static formatDate(dateString?: string, format: 'short' | 'long' = 'short'): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (format === 'long') {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  }

  static getApplicantName(userProfile?: any): string {
    if (!userProfile) return 'N/A';
    return [userProfile.firstName, userProfile.lastName]
      .filter(name => name && name.trim() !== '')
      .join(' ') || 'N/A';
  }

  static getSiteAddress(data: ProjectSiteData): string {
    return [data.address1, data.address2]
      .filter(addr => addr && addr.trim() !== '' && addr !== 'N/A')
      .join(', ') || 'N/A';
  }

  static getCommunicationAddress(userProfile?: any): string {
    if (!userProfile) return 'N/A';
    return [userProfile.commuAddress1, userProfile.commuAddress2]
      .filter(addr => addr && addr.trim() !== '' && addr !== 'N/A')
      .join(', ') || 'N/A';
  }

  // Dashboard specific mappings
  static mapToTableRow(data: ProjectSiteData, index: number = 0): DashboardTableRowData {
    console.log('🔄 [Data Mapper]: Mapping for dashboard table:', data);
    
    const userProfile = data.users?.userProfileMapping?.userProfile;
    
    const mappedData: DashboardTableRowData = {
      "S.No.": index + 1,
      "PIN": data.projectSiteId?.toString() || 'N/A',
      "Application No": 'N/A', // This might come from another field in the actual response
      "Site Address": this.getSiteAddress(data),
      "Applicant Name": this.getApplicantName(userProfile),
      "Mobile": userProfile?.mobileNo || 'N/A',
      "Communication Address": this.getCommunicationAddress(userProfile),
      "Project Purpose": this.getProjectPurpose(data.projectSiteApplicationType),
      "Action": "Details"
    };
    
    console.log('✅ [Data Mapper]: Dashboard table row mapped:', mappedData);
    return mappedData;
  }

  static mapToTableRows(dataList: ProjectSiteData[]): DashboardTableRowData[] {
    if (!dataList || dataList.length === 0) {
      return [];
    }
    return dataList.map((data, index) => this.mapToTableRow(data, index));
  }

  // Project Details specific mappings
  static mapToDetailsFields(data: ProjectSiteData): ProjectDetailsField[] {
    console.log('🔄 [Data Mapper]: Mapping for project details fields:', data);
    
    const userProfile = data.users?.userProfileMapping?.userProfile;
    
    const mappedFields: ProjectDetailsField[] = [
      { 
        label: "PIN:", 
        value: data.projectSiteId?.toString() || 'N/A',
        isHighlighted: true
      },
      { 
        label: "Date:", 
        value: this.formatDate(data.createdOnDate) 
      },
      { 
        label: "Applicant Name:", 
        value: this.getApplicantName(userProfile) 
      },
      { 
        label: "Application Purpose:", 
        value: this.getProjectPurpose(data.projectSiteApplicationType) 
      },
      { 
        label: "Mobile No:", 
        value: userProfile?.mobileNo || 'N/A' 
      },
      { 
        label: "Site Details:", 
        value: this.getSiteAddress(data) 
      },
      { 
        label: "Email:", 
        value: userProfile?.email || 'N/A' 
      },
    ];
    
    console.log('✅ [Data Mapper]: Project details fields mapped:', mappedFields);
    return mappedFields;
  }

  // Applications specific mappings - fix parameter type
  static mapToApplications(applications: any[] | undefined, _fallbackUserName?: string): ApplicationData[] {
    if (!applications || applications.length === 0) {
      // Return empty array instead of sample data
      console.log('🔍 [Data Mapper]: No applications found, returning empty array');
      return [];
    }

    console.log('🔍 [Data Mapper]: Processing applications:', applications.length);

    return applications.map((app: any, index: number) => {
      // Get application type description based on Angular logic
      const getApplicationTypeName = (applicationType: number, applicationPurposeType: number): string => {
        if (applicationType === 6 && applicationPurposeType === 1) return "Contractor Registration";
        if (applicationType === 6 && applicationPurposeType === 2) return "Contractor Renewal";
        if (applicationType === 7 && applicationPurposeType === 1) return "Supervisor Registration";
        if (applicationType === 7 && applicationPurposeType === 2) return "Supervisor Renewal";
        if (applicationType === 8 && applicationPurposeType === 1) return "Wireman Registration";
        if (applicationType === 8 && applicationPurposeType === 2) return "Wireman Renewal";
        return "-";
      };

      // Get current status based on applicationAction.appActionType (similar to Angular)
      const getCurrentStatus = (app: any): string => {
        // This would need the AppActionTypeEnum mapping, but for now use a basic mapping
        if (app.applicationAction?.appActionType) {
          // You can expand this based on the actual AppActionTypeEnum values
          switch (app.applicationAction.appActionType) {
            case 1: return "Submitted";
            case 2: return "Under Review"; 
            case 3: return "Approved";
            case 12: return "Payment Due";
            case 13: return "Payment Success";
            default: return "Unknown";
          }
        }
        
        // Fallback based on applicationLifeCycleStatusType
        switch (app.applicationLifeCycleStatusType) {
          case -1: return "Draft";
          case 0: return "In Process";
          case 1: return "Approved";
          case 2: return "Rejected";
          case 3: return "Objection";
          case 5: return "Processing";
          case 7: return "Active";
          default: return "Unknown";
        }
      };

      console.log('🔍 [Data Mapper]: Mapping application:', {
        appId: app.appId,
        applicationType: app.applicationType,
        applicationPurposeType: app.applicationPurposeType,
        status: app.applicationLifeCycleStatusType
      });

      return {
        id: (index + 1).toString(), // Sequential row number
        applicationId: app.appId?.toString() || `APP-${index + 1}`, // Use actual appId from backend
        applicationName: getApplicationTypeName(app.applicationType, app.applicationPurposeType),
        submittedOn: this.formatDate(app.createdOnDate), // Use createdOnDate
        currentStatus: getCurrentStatus(app),
        updatedOn: this.formatDate(app.lastModifiedOnDate), // Use lastModifiedOnDate
        action: 'View',
        paymentStatus: app.applicationLifeCycleStatusType === -1 && app.applicationAction?.appActionType === 12 
          ? 'Payment Due' 
          : (app.applicationLifeCycleStatusType === 0 || app.applicationLifeCycleStatusType === 3 || app.applicationLifeCycleStatusType === 5)
            ? 'Success'
            : 'Pending',
        // Add backend data for Draft button functionality
        backendAppId: app.appId, // This is the real backend ID needed for API calls
        applicationType: app.applicationType,
        applicationPurposeType: app.applicationPurposeType,
        applicationLifeCycleStatusType: app.applicationLifeCycleStatusType,
        appActionType: app.applicationAction?.appActionType
      };
    });
  }

  // Page-specific mapping dispatcher with proper return types
  static mapForPage(data: ProjectSiteData, pageType: 'dashboard' | 'projectDetails', additionalParams?: any): {
    tableRows?: DashboardTableRowData[];
    detailsFields?: ProjectDetailsField[];
    applications?: ApplicationData[];
  } {
    switch (pageType) {
      case 'dashboard':
        return {
          tableRows: [this.mapToTableRow(data, additionalParams?.index || 0)]
        };
      
      case 'projectDetails':
        const userProfile = data.users?.userProfileMapping?.userProfile;
        const applicantName = this.getApplicantName(userProfile);
        
        return {
          detailsFields: this.mapToDetailsFields(data),
          applications: this.mapToApplications(data.applications, applicantName) // This now works
        };
      
      default:
        throw new Error(`Unsupported page type: ${pageType}`);
    }
  }

  static getContractorApplicantName(projectSiteData: ProjectSiteData): string {
    console.log('📋 [CONTRACTOR-MAPPER] Extracting applicant name for contractor form');
    
    try {
      const userProfile = projectSiteData?.users?.userProfileMapping?.userProfile;
      
      if (userProfile?.firstName || userProfile?.lastName) {
        const firstName = userProfile.firstName || '';
        const lastName = userProfile.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        console.log('✅ [CONTRACTOR-MAPPER] Applicant name extracted:', fullName);
        return fullName;
      }
      
      console.log('⚠️ [CONTRACTOR-MAPPER] No applicant name found');
      return '';
    } catch (error) {
      console.error('❌ [CONTRACTOR-MAPPER] Error extracting applicant name:', error);
      return '';
    }
  }

  static getContractorApplicantAddress(projectSiteData: ProjectSiteData): string {
    console.log('📋 [CONTRACTOR-MAPPER] Extracting applicant address for contractor form');
    
    try {
      const userProfile = projectSiteData?.users?.userProfileMapping?.userProfile;
      
      // Try communication address first (Angular priority)
      if (userProfile?.commuAddress1 || userProfile?.commuAddress2) {
        const address1 = userProfile.commuAddress1 || '';
        const address2 = userProfile.commuAddress2 || '';
        const fullAddress = `${address1} ${address2}`.trim();
        
        console.log('✅ [CONTRACTOR-MAPPER] Applicant address from user profile:', fullAddress);
        return fullAddress;
      }
      
      // Fallback to project site address fields
      if (projectSiteData?.address1 || projectSiteData?.address2) {
        const address1 = projectSiteData.address1 || '';
        const address2 = projectSiteData.address2 || '';
        const fullAddress = `${address1} ${address2}`.trim();
        
        console.log('✅ [CONTRACTOR-MAPPER] Applicant address from project site:', fullAddress);
        return fullAddress;
      }
      
      console.log('⚠️ [CONTRACTOR-MAPPER] No applicant address found');
      return '';
    } catch (error) {
      console.error('❌ [CONTRACTOR-MAPPER] Error extracting applicant address:', error);
      return '';
    }
  }

  static getContractorApplicantPAN(projectSiteData: ProjectSiteData): string {
    console.log('📋 [CONTRACTOR-MAPPER] Extracting applicant PAN for contractor form');
    
    try {
      const panNumber = projectSiteData?.applicantPanNumber;
      
      if (panNumber && panNumber.trim() !== '') {
        console.log('✅ [CONTRACTOR-MAPPER] Applicant PAN extracted:', panNumber);
        return panNumber.trim();
      }
      
      console.log('⚠️ [CONTRACTOR-MAPPER] No applicant PAN found');
      return '';
    } catch (error) {
      console.error('❌ [CONTRACTOR-MAPPER] Error extracting applicant PAN:', error);
      return '';
    }
  }

  static getContractorFormData(projectSiteData: ProjectSiteData): {
    applicantName: string;
    applicantAddress: string;
    applicantPAN: string;
    contractorLicenceId?: number;
    apprefId?: number;
  } {
    console.log('📋 [CONTRACTOR-MAPPER] ===== EXTRACTING CONTRACTOR FORM DATA =====');
    console.log('📋 [CONTRACTOR-MAPPER] Input projectSiteData:', projectSiteData);
    console.log('📋 [CONTRACTOR-MAPPER] Users object:', projectSiteData?.users);
    console.log('📋 [CONTRACTOR-MAPPER] UserProfileMapping:', projectSiteData?.users?.userProfileMapping);
    console.log('📋 [CONTRACTOR-MAPPER] UserProfile:', projectSiteData?.users?.userProfileMapping?.userProfile);
    console.log('📋 [CONTRACTOR-MAPPER] ApplicantPanNumber:', projectSiteData?.applicantPanNumber);
    console.log('📋 [CONTRACTOR-MAPPER] Applications array:', projectSiteData?.applications);
    
    // ✅ FIX: Extract contractorLicenceId from applications array
    let contractorLicenceId: number | undefined;
    let apprefId: number | undefined;
    
    if (projectSiteData?.applications && projectSiteData.applications.length > 0) {
      const application = projectSiteData.applications[0]; // Get first application
      console.log('📋 [CONTRACTOR-MAPPER] First application:', application);
      console.log('📋 [CONTRACTOR-MAPPER] Application appId:', application?.appId);
      console.log('📋 [CONTRACTOR-MAPPER] ContractorLicence_GeneralDetails:', application?.contractorLicence_GeneralDetails);
      
      if (application?.appId) {
        apprefId = application.appId;
        console.log('✅ [CONTRACTOR-MAPPER] Extracted apprefId:', apprefId);
      }
      
      if (application?.contractorLicence_GeneralDetails?.contractorLicenceId) {
        contractorLicenceId = application.contractorLicence_GeneralDetails.contractorLicenceId;
        console.log('✅ [CONTRACTOR-MAPPER] Extracted contractorLicenceId:', contractorLicenceId);
      }
    }
    
    const result = {
      applicantName: this.getContractorApplicantName(projectSiteData),
      applicantAddress: this.getContractorApplicantAddress(projectSiteData),
      applicantPAN: this.getContractorApplicantPAN(projectSiteData),
      contractorLicenceId,
      apprefId
    };
    
    console.log('📋 [CONTRACTOR-MAPPER] ===== FINAL EXTRACTED DATA =====');
    console.log('📋 [CONTRACTOR-MAPPER] Result:', result);
    
    return result;
  }
  
}

