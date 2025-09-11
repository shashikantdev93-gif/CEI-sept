/**
 * Supervisor and Wireman Types
 * 
 * TypeScript interfaces for supervisor and wireman management
 * matching Angular supervisor-details component structure
 */

export interface SupervisorData {
  id: number;
  fullName: string;
  licenceNo: string;
  licenceValidUpto: string;
  panNo: string;
  districtRefId: number;
  districtName: string;
  tehsilRefId: number;
  tehsilName: string;
  isOnline: boolean;
  licenceDocument: string;
  panNoDocument: string;
  contractorLicenceRefId: number;
  licenceExpired?: boolean;
}

export interface WiremanData {
  id: number;
  fullName: string;
  licenceNo: string;
  licenceValidUpto: string;
  panNo: string;
  districtRefId: number;
  districtName: string;
  tehsilRefId: number;
  tehsilName: string;
  isOnline: boolean;
  licenceDocument: string;
  panNoDocument: string;
  contractorLicenceRefId: number;
  licenceExpired?: boolean;
}

export interface SupervisorFormData {
  fullName: string;
  licenceNo: string;
  licenceValidUpto: string;
  panNo: string;
  licenceDocument: string;
  panNoDocument: string;
  districtRefId: string;
  tehsilRefId: string;
}

export interface WiremanFormData {
  fullName: string;
  licenceNo: string;
  licenceValidUpto: string;
  panNo: string;
  licenceDocument: string;
  panNoDocument: string;
  districtRefId: string;
  tehsilRefId: string;
}

export interface SupervisorFormErrors {
  [key: string]: string;
}

export interface WiremanFormErrors {
  [key: string]: string;
}
