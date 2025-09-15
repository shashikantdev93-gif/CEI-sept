/**
 * Service for building API payloads for Save & Next flow
 * Matches Angular payload structure exactly
 */
import { getContractorTypeId, getVoltageTypeId } from '../constants/contractor';

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
   * Build contractor application payload (Angular Exact Parity)
   * Angular: ContractorLicence/addUpdateContractApplication_GeneralDetails
   */
  static buildContractorPayload(data: ContractorPayloadData, licenseCalculation: any): any {
    console.log('🏗️ [PAYLOAD-BUILDER] Building contractor payload (Angular Parity)');
    console.log('🏗️ [PAYLOAD-BUILDER] Input data:', data);
    console.log('🏗️ [PAYLOAD-BUILDER] License calculation:', licenseCalculation);
    
    // Convert string names to numeric IDs (Angular format)
    const contractorTypeId = getContractorTypeId(data.contractorType);
    const workingVoltageTypeId = getVoltageTypeId(data.currentWorkingVoltage);
    
    console.log('🏗️ [PAYLOAD-BUILDER] ===== TYPE CONVERSION =====');
    console.log('🏗️ [PAYLOAD-BUILDER] contractorType string:', `"${data.contractorType}"`);
    console.log('🏗️ [PAYLOAD-BUILDER] contractorType ID:', contractorTypeId);
    console.log('🏗️ [PAYLOAD-BUILDER] currentWorkingVoltage string:', `"${data.currentWorkingVoltage}"`);
    console.log('🏗️ [PAYLOAD-BUILDER] currentWorkingVoltage ID:', workingVoltageTypeId);
    
    // Validate conversions worked
    if (contractorTypeId === 0) {
      console.warn('⚠️ [PAYLOAD-BUILDER] contractorType mapping failed! Using default (3)');
    }
    if (workingVoltageTypeId === 0) {
      console.warn('⚠️ [PAYLOAD-BUILDER] currentWorkingVoltage mapping failed! Using default (1)');
    }
    
    // Angular working voltage change detection (renewal logic)
    const isWorkingVoltageChange = data.contractorFormMode === 'renew' || data.contractorFormMode === 'renew_first' 
      ? (data.contractorInfo?.applicationWorkingVoltageType !== workingVoltageTypeId)
      : false;
    
    // Angular conditional business logic for Individual contractors (ID 3)
    const isIndividualContractor = contractorTypeId === 3;
    console.log('🏗️ [PAYLOAD-BUILDER] Is individual contractor (type 3):', isIndividualContractor);
    
    const payload = {
      contractorLicenceId: data.contractorLicenceId || 0,
      appRefId: data.apprefId,
      applicationContractorType: contractorTypeId || 3, // Default to Individual if mapping fails
      applicationWorkingVoltageType: workingVoltageTypeId || 1, // Default to Low/Medium if mapping fails
      panNumber: data.panCardNumber || "",
      // Angular exact logic: this.contractorType === '3' ? 'N/A' : this.applicantDetailsForm?.value?.nameOfSigneeOfCompany
      nameOfSigneeOfCompany: isIndividualContractor ? 'N/A' : (data.signeeNameOnBehalfOfCompany || ''),
      // Angular exact logic: this.contractorType === '3' ? 'N/A' : this.applicantDetailsForm?.value?.businessEntity  
      businessEntity: isIndividualContractor ? 'N/A' : (data.businessEntity || ''),
      // Angular exact logic: this.contractorType === '3' ? 'N/A' : this.applicantDetailsForm?.value?.businessEntityAddress
      businessEntityAddress: isIndividualContractor ? 'N/A' : (data.businessEntityAddress || ''),
      isActive: true,
      isDeleted: false,
      createdOnDate: licenseCalculation.currentDate,
      lastModifiedOnDate: licenseCalculation.currentDate,
      licenceNoOfYear: licenseCalculation.licenceNoOfYear,
      // Angular remarks logic
      remarks: data.contractorInfo?.contractorLicence_GeneralDetails?.remarks || 'N/A',
      licenceValidUpto: licenseCalculation.licenceValidUpto,
      isCross30Days: data.is30DaysCrossed || false,
      isOtherStatePermit: false,
      isWorkingVoltageChange: isWorkingVoltageChange
    };
    
    console.log('🏗️ [PAYLOAD-BUILDER] ===== FINAL CONTRACTOR APPLICANT PAYLOAD =====');
    console.log('🏗️ [PAYLOAD-BUILDER] Raw payload object:', payload);
    console.log('🏗️ [PAYLOAD-BUILDER] Payload details:');
    console.log('🏗️ [PAYLOAD-BUILDER] - contractorLicenceId:', payload.contractorLicenceId);
    console.log('🏗️ [PAYLOAD-BUILDER] - appRefId:', payload.appRefId);
    console.log('🏗️ [PAYLOAD-BUILDER] - applicationContractorType:', payload.applicationContractorType);
    console.log('🏗️ [PAYLOAD-BUILDER] - applicationWorkingVoltageType:', payload.applicationWorkingVoltageType);
    console.log('🏗️ [PAYLOAD-BUILDER] - panNumber:', payload.panNumber);
    console.log('🏗️ [PAYLOAD-BUILDER] - nameOfSigneeOfCompany:', payload.nameOfSigneeOfCompany);
    console.log('🏗️ [PAYLOAD-BUILDER] - businessEntity:', payload.businessEntity);
    console.log('🏗️ [PAYLOAD-BUILDER] - businessEntityAddress:', payload.businessEntityAddress);
    console.log('🏗️ [PAYLOAD-BUILDER] - isActive:', payload.isActive);
    console.log('🏗️ [PAYLOAD-BUILDER] - isDeleted:', payload.isDeleted);
    console.log('🏗️ [PAYLOAD-BUILDER] - createdOnDate:', payload.createdOnDate);
    console.log('🏗️ [PAYLOAD-BUILDER] - lastModifiedOnDate:', payload.lastModifiedOnDate);
    console.log('🏗️ [PAYLOAD-BUILDER] - licenceNoOfYear:', payload.licenceNoOfYear);
    console.log('🏗️ [PAYLOAD-BUILDER] - remarks:', payload.remarks);
    console.log('🏗️ [PAYLOAD-BUILDER] - licenceValidUpto:', payload.licenceValidUpto);
    console.log('🏗️ [PAYLOAD-BUILDER] - isCross30Days:', payload.isCross30Days);
    console.log('🏗️ [PAYLOAD-BUILDER] - isOtherStatePermit:', payload.isOtherStatePermit);
    console.log('🏗️ [PAYLOAD-BUILDER] - isWorkingVoltageChange:', payload.isWorkingVoltageChange);
    
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
   * Build encrypted query parameters for navigation (Angular Exact Parity)
   * Angular: Query parameter encryption for navigation
   */
  static buildQueryParams(
    data: any,
    encryptionService: any
  ): Record<string, string> {
    console.log('🔐 [PAYLOAD-BUILDER] Building encrypted query parameters (Angular Parity)');
    
    // Angular exact parameter names and structure
    const queryParams: Record<string, string> = {
      workingAreaList: encryptionService.set(JSON.stringify(data.workingAreaList || [])),
      formMode: encryptionService.set(data.contractorFormMode || 'new'),
      selectedWorkingAreaDistrictsList: encryptionService.set(JSON.stringify(data.selectedWorkingAreaDistrictsList || [])),
      appRefId: encryptionService.set(data.apprefId?.toString() || '0'),
      applicationIsLocked: encryptionService.set((data.applicationIsLocked === undefined ? false : data.applicationIsLocked).toString()),
      contractorLicenceId: encryptionService.set(data.contractorLicenceId?.toString() || '0'),
      applicationContractorType: encryptionService.set(data.applicationContractorType?.toString() || '3'),
    };

    console.log('🔐 [PAYLOAD-BUILDER] Base query params prepared:', {
      workingAreaList: 'encrypted(' + JSON.stringify(data.workingAreaList || []) + ')',
      formMode: 'encrypted(' + (data.contractorFormMode || 'new') + ')',
      selectedWorkingAreaDistrictsList: 'encrypted(' + JSON.stringify(data.selectedWorkingAreaDistrictsList || []) + ')',
      appRefId: 'encrypted(' + (data.apprefId?.toString() || '0') + ')',
      applicationIsLocked: 'encrypted(' + (data.applicationIsLocked === undefined ? false : data.applicationIsLocked).toString() + ')',
      contractorLicenceId: 'encrypted(' + (data.contractorLicenceId?.toString() || '0') + ')',
      applicationContractorType: 'encrypted(' + (data.applicationContractorType?.toString() || '3') + ')',
    });

    // Add renewAppId only if it is defined and not null (Angular exact logic)
    if (data.renewAppId) {
      queryParams.renewAppId = encryptionService.set(data.renewAppId.toString());
      console.log('🔐 [PAYLOAD-BUILDER] Added renewAppId to query params:', 'encrypted(' + data.renewAppId.toString() + ')');
    } else {
      console.log('🔐 [PAYLOAD-BUILDER] renewAppId is null/undefined, not adding to query params');
    }

    if (data.is30DaysCrossed === true || data.is30DaysCrossed === false) {
      queryParams.is30DaysCrossed = encryptionService.set(data.is30DaysCrossed.toString());
      console.log('🔐 [PAYLOAD-BUILDER] Added is30DaysCrossed to query params:', 'encrypted(' + data.is30DaysCrossed.toString() + ')');
    } else {
      console.log('🔐 [PAYLOAD-BUILDER] is30DaysCrossed is undefined, not adding to query params');
    }
    
    console.log('🔐 [PAYLOAD-BUILDER] Final query params structure:', queryParams);
    console.log('🔐 [PAYLOAD-BUILDER] Final encrypted query params structure created');
    return queryParams;
  }

  /**
   * Build Save & Next query parameters with Angular compatibility for attachments component
   * Used specifically for navigation from Supervisor page to attachments page
   */
  static buildSaveAndNextQueryParams(
    data: any,
    encryptionService: any
  ): Record<string, string> {
    console.log('🔐 [PAYLOAD-BUILDER] Building Save & Next encrypted query parameters (Angular attachments compatibility)');
    
    // Angular attachments component expected parameter names and structure
    const queryParams: Record<string, string> = {
      // Core application data (Angular format)
      appRefId: encryptionService.set(data.appRefId?.toString() || '0'),
      
      // Form mode: '1' for new, '2' for edit (Angular attachments expects this format)
      formMode: encryptionService.set(data.contractorFormMode === 'new' ? '1' : '2'),
      
      // Application type: always '6' for contractor applications (Angular requirement)
      applicationType: encryptionService.set('6'),
      
      // Contractor type (Angular format)
      applicationContractorType: encryptionService.set(data.applicationContractorType?.toString() || ''),
      
      // Application state (Angular expects 'isFormLocked', not 'applicationIsLocked')
      isFormLocked: encryptionService.set((data.applicationIsLocked || false).toString()),
      
      // Upload and file management flags (Angular requirements)
      isUploadShows: encryptionService.set('false'),
      deleteTempFiles: encryptionService.set('false'),
      
      // Stepper state data (Angular requirement - build from React data)
      appformstep: encryptionService.set(JSON.stringify({
        isContractorInfo: true,
        isContractorSupervisor: true,
        isContractorAttachments: false,
        isContractorApplicationLock: false,
        isContractorPayment: false,
        stepCompleted: {
          contractorInfo: true,
          contractorSupervisor: true,
          contractorAttachments: false,
          contractorApplicationLock: false,
          contractorPayment: false
        }
      })),
      
      // Navigation context (Angular requirement)
      previousRouteUrl: encryptionService.set('/dashboard/license/contractor-supervisor'),
    };

    // Optional parameter: is30DaysCrossed
    if (data.is30DaysCrossed === true || data.is30DaysCrossed === false) {
      queryParams.is30DaysCrossed = encryptionService.set(data.is30DaysCrossed.toString());
    }

    console.log('🔐 [PAYLOAD-BUILDER] Save & Next query params prepared:', {
      appRefId: 'encrypted(' + (data.appRefId?.toString() || '0') + ')',
      formMode: 'encrypted(' + (data.contractorFormMode === 'new' ? '1' : '2') + ')',
      applicationType: 'encrypted(6)',
      applicationContractorType: 'encrypted(' + (data.applicationContractorType?.toString() || '') + ')',
      isFormLocked: 'encrypted(' + (data.applicationIsLocked || false).toString() + ')',
      isUploadShows: 'encrypted(false)',
      deleteTempFiles: 'encrypted(false)',
      appformstep: 'encrypted(stepper_object)',
      previousRouteUrl: 'encrypted(/dashboard/license/contractor-supervisor)',
      is30DaysCrossed: data.is30DaysCrossed !== undefined ? 'encrypted(' + data.is30DaysCrossed.toString() + ')' : 'not included'
    });
    
    console.log('🔐 [PAYLOAD-BUILDER] Save & Next final query params structure created');
    return queryParams;
  }
}
