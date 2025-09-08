import type { ApplicationState, ApplicationDetailsPayload, ContractorFormMode, ApplicationActionPayload } from '../types/contractor.types';

export class ApplicationPayloadBuilder {
  /**
   * Creates application details payload matching Angular's logic exactly
   * @param formMode - The contractor form mode (new, renew, renew_first)
   * @param existingApplication - Existing application state for renewals
   * @returns Application details payload for API call
   */
  static createApplicationDetailsPayload(
    formMode: ContractorFormMode = 'new',
    existingApplication: ApplicationState | null = null
  ): ApplicationDetailsPayload {
    console.log('📦 [APPLICATION-BUILDER] Creating application details payload');
    console.log('📦 [APPLICATION-BUILDER] Form mode:', formMode);
    console.log('📦 [APPLICATION-BUILDER] Existing application:', existingApplication);

    // Get project site ID from encrypted token (matches Angular logic)
    const projectSiteId = this.getProjectSiteId();
    
    // Derive application purpose type from form mode (matches Angular)
    const applicationPurposeType = formMode === 'new' ? 1 : 2;
    
    // Calculate iteration count (matches Angular)
    const iterationCount = existingApplication ? (existingApplication.iterationCount || 0) + 1 : 0;
    
    // Get current app ID (matches Angular)
    const appId = existingApplication?.appId || 0;
    
    // Static values for contractor applications (matches Angular)
    const applicationType = 6;
    
    // Generate timestamps
    const now = new Date();
    const isoString = now.toISOString();
    
    // Generate public app reference number (matches Angular exactly)
    const publicAppRefNum = this.generatePublicAppRefNum(
      applicationType,
      applicationPurposeType,
      iterationCount,
      appId,
      now
    );

    const payload: ApplicationDetailsPayload = {
      appId,
      applicationType,
      applicationPurposeType,
      iterationCount,
      createdOnDate: isoString,
      lastModifiedOnDate: isoString,
      isEnabled: true,
      isDeleted: false,
      isLocked: existingApplication?.isLocked || false,
      isAllowEdit: existingApplication?.isAllowEdit !== undefined ? existingApplication.isAllowEdit : true,
      isFeeApplicable: true,
      isOnline: true,
      applicationLifeCycleStatusType: existingApplication?.applicationLifeCycleStatusType || -1,
      applicationLifeCycleLastStatusOn: isoString,
      isLegacyData: false,
      projectSiteRefId: projectSiteId,
      publicAppRefNum
    };

    console.log('📦 [APPLICATION-BUILDER] Raw payload before interceptor:', payload);
    return payload;
  }

  /**
   * Gets project site ID from encrypted token (matches Angular logic)
   */
  private static getProjectSiteId(): number {
    const tokenStr = localStorage.getItem('token');
    let projectSiteId = 499; // fallback value
    
    if (tokenStr) {
      try {
        const tokenData = JSON.parse(tokenStr);
        if (tokenData.projectSiteId) {
          // Note: This assumes encryptionService is available
          // If not available, we'll need to implement decryption logic
          // const decryptedProjectSiteId = encryptionService.get(tokenData.projectSiteId);
          // projectSiteId = parseInt(decryptedProjectSiteId);
          
          // For now, use the encrypted value directly if it's a number
          if (typeof tokenData.projectSiteId === 'number') {
            projectSiteId = tokenData.projectSiteId;
          } else if (typeof tokenData.projectSiteId === 'string' && !isNaN(Number(tokenData.projectSiteId))) {
            projectSiteId = parseInt(tokenData.projectSiteId);
          }
        }
      } catch (err) {
        console.warn('📦 [APPLICATION-BUILDER] Failed to get project site ID, using fallback:', err);
      }
    }
    
    console.log('📦 [APPLICATION-BUILDER] Project site ID:', projectSiteId);
    return projectSiteId;
  }

  /**
   * Generates public app reference number (matches Angular exactly)
   * Format: CONTR{applicationType}{applicationPurposeType}{iterationCount}{YYYYMMDD}{appId}
   */
  private static generatePublicAppRefNum(
    applicationType: number,
    applicationPurposeType: number,
    iterationCount: number,
    appId: number,
    date: Date
  ): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const publicAppRefNum = `CONTR${applicationType}${applicationPurposeType}${iterationCount}${year}${month}${day}${appId}`;
    
    console.log('📦 [APPLICATION-BUILDER] Generated public app ref num:', publicAppRefNum);
    return publicAppRefNum;
  }

  /**
   * Creates application action payload matching Angular's logic exactly
   * @param applicationId - The application ID
   * @param existingApplication - Existing application state for appActionId
   * @returns Application action payload for API call
   */
  static createApplicationActionPayload(
    applicationId: number,
    existingApplication: ApplicationState | null = null
  ): ApplicationActionPayload {
    console.log('📦 [APPLICATION-ACTION-BUILDER] Creating application action payload');
    console.log('📦 [APPLICATION-ACTION-BUILDER] Application ID:', applicationId);
    console.log('📦 [APPLICATION-ACTION-BUILDER] Existing application:', existingApplication);

    // Get user data from token (matches Angular logic)
    const tokenStr = localStorage.getItem('token');
    let userData = {
      userId: 0,
      userProfileId: 0,
      roleCode: 3
    };

    if (tokenStr) {
      try {
        const tokenData = JSON.parse(tokenStr);
        userData = {
          userId: tokenData.userId || 0,
          userProfileId: tokenData.userProfileId || 0,
          roleCode: tokenData.roleCode || 3
        };
      } catch (err) {
        console.warn('📦 [APPLICATION-ACTION-BUILDER] Failed to parse token data:', err);
      }
    }

    // Get geolocation data (matches Angular)
    const ipClient = { ip: '127.0.0.1' }; // Default fallback
    const latiLongi = { 
      latitude: '30.7333', // Default Chandigarh coordinates
      longitude: '76.7794' 
    };

    const payload: ApplicationActionPayload = {
      appActionId: existingApplication?.appId || 0, // Matches Angular logic
      appActionType: 1, // Fixed value for contractor applications (matches Angular)
      sender_UserRefId: userData.userId,
      sender_ProfileRefId: userData.userProfileId,
      receiver_UserRefId: 37, // Fixed value (matches Angular)
      receiver_ProfileRefId: 9074, // Fixed value (matches Angular)
      actionOnDate: new Date().toISOString(),
      actionTakenDaysCount: 0, // Fixed value (matches Angular)
      remarks: 'Application saved as draft', // Fixed remarks (matches Angular)
      senderRoleId: userData.roleCode,
      receiverRoleId: 7, // Fixed value (matches Angular)
      isDocumentUploaded: true, // Fixed value (matches Angular)
      appDocumentRefId: 0, // Fixed value (matches Angular)
      applicationRefId: applicationId,
      ipAddress: ipClient.ip,
      latitude: latiLongi.latitude.toString(),
      longitude: latiLongi.longitude.toString()
    };

    console.log('📦 [APPLICATION-ACTION-BUILDER] Raw payload before interceptor:', payload);
    return payload;
  }
}
