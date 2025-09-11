import type { SupervisorFormData, WiremanFormData, SupervisorData, WiremanData } from '../types/supervisor.types';
import type { District, Tehsil } from '../utils/locationService';
import { EMPTY_SUPERVISOR_FORM, EMPTY_WIREMAN_FORM } from '../constants/supervisor';

/**
 * Supervisor and Wireman Utility Functions
 * 
 * Helper functions for data transformation, validation, and form management
 */

// Transform form data to supervisor data
export const transformSupervisorFormToData = (
  formData: SupervisorFormData,
  districts: District[],
  tehsils: Tehsil[],
  isOnline: boolean,
  contractorLicenceRefId: number = 1
): Omit<SupervisorData, 'id'> => {
  const district = districts.find(d => d.districtCode === Number(formData.districtRefId));
  const tehsil = tehsils.find(t => t.tehsilId === Number(formData.tehsilRefId));

  return {
    fullName: formData.fullName,
    licenceNo: formData.licenceNo,
    licenceValidUpto: formData.licenceValidUpto,
    panNo: formData.panNo.toUpperCase(),
    districtRefId: Number(formData.districtRefId),
    districtName: district?.districtName || '',
    tehsilRefId: Number(formData.tehsilRefId),
    tehsilName: tehsil?.tehsilName || '',
    isOnline,
    licenceDocument: formData.licenceDocument,
    panNoDocument: formData.panNoDocument,
    contractorLicenceRefId
  };
};

// Transform form data to wireman data
export const transformWiremanFormToData = (
  formData: WiremanFormData,
  districts: District[],
  tehsils: Tehsil[],
  isOnline: boolean,
  contractorLicenceRefId: number = 1
): Omit<WiremanData, 'id'> => {
  const district = districts.find(d => d.districtCode === Number(formData.districtRefId));
  const tehsil = tehsils.find(t => t.tehsilId === Number(formData.tehsilRefId));

  return {
    fullName: formData.fullName,
    licenceNo: formData.licenceNo,
    licenceValidUpto: formData.licenceValidUpto,
    panNo: formData.panNo.toUpperCase(),
    districtRefId: Number(formData.districtRefId),
    districtName: district?.districtName || '',
    tehsilRefId: Number(formData.tehsilRefId),
    tehsilName: tehsil?.tehsilName || '',
    isOnline,
    licenceDocument: formData.licenceDocument,
    panNoDocument: formData.panNoDocument,
    contractorLicenceRefId
  };
};

// Clear form for online mode (only specific fields)
export const clearFormForOnlineMode = <T extends SupervisorFormData | WiremanFormData>(
  currentForm: T
): T => {
  return {
    ...currentForm,
    fullName: '',
    licenceValidUpto: '',
    panNo: ''
  };
};

// Reset form to empty state
export const resetSupervisorForm = (): SupervisorFormData => ({ ...EMPTY_SUPERVISOR_FORM });
export const resetWiremanForm = (): WiremanFormData => ({ ...EMPTY_WIREMAN_FORM });

// Check if licence is expired
export const isLicenceExpired = (validUpto: string): boolean => {
  const validDate = new Date(validUpto);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return validDate <= today;
};

// Format supervisor data for DataTable display
export const formatSupervisorForTable = (supervisors: SupervisorData[]) => {
  return supervisors.map((supervisor, index) => ({
    'S.No.': index + 1,
    'Name Of Supervisor': supervisor.fullName,
    'Certificate Number': supervisor.licenceNo,
    District: supervisor.districtName,
    Tehsil: supervisor.tehsilName,
    'Valid Upto': supervisor.licenceValidUpto,
    Online: supervisor.isOnline ? 'Yes' : 'No',
    Action: 'Delete',
    id: supervisor.id,
    supervisorData: supervisor
  }));
};

// Format wireman data for DataTable display
export const formatWiremanForTable = (wiremen: WiremanData[]) => {
  return wiremen.map((wireman, index) => ({
    'S.No.': index + 1,
    'Appointed Wireman': wireman.fullName,
    'Permit Number': wireman.licenceNo,
    District: wireman.districtName,
    Tehsil: wireman.tehsilName,
    'Valid Upto': wireman.licenceValidUpto,
    Online: wireman.isOnline ? 'Yes' : 'No',
    Action: 'Delete',
    id: wireman.id,
    wiremanData: wireman
  }));
};

// Generate success messages
export const getSuccessMessage = (type: 'supervisor' | 'wireman', action: 'add' | 'delete' = 'add'): string => {
  const entity = type === 'supervisor' ? 'Supervisor' : 'Wireman';
  const actionText = action === 'add' ? 'added' : 'deleted';
  return `${entity} ${actionText} successfully!`;
};

// Generate error messages
export const getErrorMessage = (type: 'supervisor' | 'wireman', action: 'add' | 'delete' = 'add'): string => {
  const entity = type === 'supervisor' ? 'supervisor' : 'wireman';
  const actionText = action === 'add' ? 'add' : 'delete';
  return `Failed to ${actionText} ${entity}. Please try again.`;
};
