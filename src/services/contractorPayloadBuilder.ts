/**
 * Service for building API payloads for Save & Next flow
 * Matches Angular payload structure exactly
 */

export interface ContractorPayloadData {
  contractorLicenceId?: number;
  apprefId: number;
  contractorType: string;
  currentWorkingVoltage: string;
  panCardNumber: string;
  signeeNameOnBehalfOfCompany?: string;
  businessEntity?: string;
  businessEntityAddress?: string;
  is30DaysCrossed?: boolean;
  contractorFormMode: string;
  contractorInfo?: any;
}

export interface UserContextData {
  userId?: number;
  userProfileId?: number;
  projectSiteId?: number;
  ipAddress?: string;
  latitude?: string;
  longitude?: string;
}

export class ContractorPayloadBuilder {
  
  /**
   * Build contractor application payload
   * Angular: ContractorLicence/addUpdateContractApplication_GeneralDetails
   */
  static buildContractorPayload(data: ContractorPayloadData, licenseCalculation: any): any {
    console.log('🏗️ [PAYLOAD-BUILDER] Building contractor payload');
    console.log('🏗️ [PAYLOAD-BUILDER] Input data:', data);
    console.log('🏗️ [PAYLOAD-BUILDER] License calculation:', licenseCalculation);
    
    // Detect working voltage change
    const isWorkingVoltageChange = data.contractorInfo?.applicationWorkingVoltageType !== 
                                  parseInt(data.currentWorkingVoltage);
    
    const payload = {
      contractorLicenceId: data.contractorLicenceId || 0,
      appRefId: data.apprefId,
      applicationContractorType: parseInt(data.contractorType),
      applicationWorkingVoltageType: parseInt(data.currentWorkingVoltage),
      panNumber: data.panCardNumber,
      nameOfSigneeOfCompany: data.signeeNameOnBehalfOfCompany || '',
      businessEntity: data.businessEntity || '',
      businessEntityAddress: data.businessEntityAddress || '',
      isActive: true,
      isDeleted: false,
      createdOnDate: licenseCalculation.currentDate,
      lastModifiedOnDate: licenseCalculation.currentDate,
      licenceNoOfYear: licenseCalculation.licenceNoOfYear,
      remarks: "N/A",
      licenceValidUpto: licenseCalculation.licenceValidUpto,
      isCross30Days: data.is30DaysCrossed || false,
      isOtherStatePermit: false,
      isWorkingVoltageChange: isWorkingVoltageChange
    };
    
    console.log('🏗️ [PAYLOAD-BUILDER] Final contractor payload:', payload);
    return payload;
  }
  
  /**
   * Build application details payload
   * Angular: Application/addUpdate_ApplicationDetails
   */
  static buildApplicationDetailsPayload(
    apprefId: number, 
    contractorType: string, 
    contractorFormMode: string,
    userContext: UserContextData,
    application?: any
  ): any {
    console.log('📋 [PAYLOAD-BUILDER] Building application details payload');
    
    const currentDate = new Date();
    
    const payload = {
      appId: application ? apprefId : 0,
      applicationType: 6,  // contractor = 6
      applicationPurposeType: contractorFormMode === 'new' ? 1 : 2, // new = 1, renew = 2
      iterationCount: application ? (application.iterationCount || 0) + 1 : 0,
      createdOnDate: currentDate,
      lastModifiedOnDate: currentDate,
      isEnabled: true,
      isDeleted: false,
      isLocked: false,
      isAllowEdit: true,
      isFeeApplicable: true,
      isOnline: true,
      applicationLifeCycleStatusType: -1,
      applicationLifeCycleLastStatusOn: currentDate,
      isLegacyData: false,
      projectSiteRefId: userContext.projectSiteId,
      publicAppRefNum: application?.publicAppRefNum || 
        `CONTR${contractorType}${currentDate.getFullYear()}${apprefId.toString().padStart(6, '0')}`
    };
    
    console.log('📋 [PAYLOAD-BUILDER] Application details payload:', payload);
    return payload;
  }
  
  /**
   * Build application action payload
   * Angular: Application/addUpdate_ApplicationAction
   */
  static buildApplicationActionPayload(
    apprefId: number,
    contractorFormMode: string,
    userContext: UserContextData,
    application?: any
  ): any {
    console.log('🎬 [PAYLOAD-BUILDER] Building application action payload');
    
    const currentDate = new Date();
    
    const payload = {
      appActionId: application?.applicationAction?.appActionId || 0,
      appActionType: 1, // Submit action
      sender_UserRefId: userContext.userId || 0,
      sender_ProfileRefId: userContext.userProfileId || 0,
      receiver_UserRefId: 37, // Default system user
      receiver_ProfileRefId: 9074, // Default system profile
      actionOnDate: currentDate,
      actionTakenDaysCount: 0,
      remarks: `Application ${contractorFormMode === 'new' ? 'created' : 'updated'} by applicant`,
      senderRoleId: 3, // Applicant role
      receiverRoleId: 7, // Officer role
      isDocumentUploaded: true,
      appDocumentRefId: 0,
      applicationRefId: apprefId,
      ipAddress: userContext.ipAddress || '127.0.0.1',
      latitude: userContext.latitude || '0',
      longitude: userContext.longitude || '0'
    };
    
    console.log('🎬 [PAYLOAD-BUILDER] Application action payload:', payload);
    return payload;
  }
  
  /**
   * Build encrypted query parameters for navigation
   * Angular: Query parameter encryption for navigation
   */
  static buildQueryParams(
    data: any,
    encryptionService: any
  ): Record<string, string> {
    console.log('🔐 [PAYLOAD-BUILDER] Building encrypted query parameters');
    
    const queryParams: Record<string, string> = {
      workingAreaList: encryptionService.set(JSON.stringify(data.workingAreaList || [])),
      formMode: encryptionService.set(data.contractorFormMode || 'new'),
      selectedWorkingAreaDistrictsList: encryptionService.set(JSON.stringify(data.selectedWorkingAreaDistrictsList || [])),
      appRefId: encryptionService.set(data.apprefId?.toString() || '0'),
      applicationIsLocked: encryptionService.set(data.applicationIsLocked?.toString() || 'false'),
      contractorLicenceId: encryptionService.set(data.contractorLicenceId?.toString() || '0'),
      applicationContractorType: encryptionService.set(data.contractorType?.toString() || '3'),
    };

    // Conditional parameters based on application type
    if (data.renewAppId !== null && data.renewAppId !== undefined) {
      queryParams.renewAppId = encryptionService.set(data.renewAppId.toString());
      console.log('🔐 [PAYLOAD-BUILDER] Added renewAppId to query params');
    }

    if (data.is30DaysCrossed !== null && data.is30DaysCrossed !== undefined) {
      queryParams.is30DaysCrossed = encryptionService.set(data.is30DaysCrossed.toString());
      console.log('🔐 [PAYLOAD-BUILDER] Added is30DaysCrossed to query params');
    }
    
    console.log('🔐 [PAYLOAD-BUILDER] Final encrypted query params structure created');
    return queryParams;
  }
}
