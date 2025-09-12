/**
 * Supervisor and Wireman Constants
 * 
 * Constants, validation patterns, and messages for supervisor/wireman management
 * matching Angular regex_validation.ts patterns
 */

import type { SupervisorFormData, WiremanFormData } from '../types/supervisor.types';

// Angular regex patterns (from regex_validation.ts)
export const SUPERVISOR_VALIDATION_PATTERNS = {
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  NAME: /^[a-zA-Z\s]*$/,
  LICENCE_NUMBER: /^[a-zA-Z0-9\s\-\/]*$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]*$/
} as const;

// Angular validation messages
export const SUPERVISOR_VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  PAN_INVALID: 'Please enter a valid PAN number (e.g., ABCDE1234F)',
  NAME_INVALID: 'Name should contain only alphabets and spaces',
  LICENCE_INVALID: 'Licence number contains invalid characters',
  DATE_INVALID: 'Please enter a valid date',
  DATE_FUTURE: 'Date should be in the future',
  DISTRICT_REQUIRED: 'Please select a district',
  TEHSIL_REQUIRED: 'Please select a tehsil'
} as const;

// Form field names
export const SUPERVISOR_FORM_FIELDS = {
  FULL_NAME: 'fullName',
  LICENCE_NO: 'licenceNo',
  LICENCE_VALID_UPTO: 'licenceValidUpto',
  PAN_NO: 'panNo',
  DISTRICT_REF_ID: 'districtRefId',
  TEHSIL_REF_ID: 'tehsilRefId',
  LICENCE_DOCUMENT: 'licenceDocument',
  PAN_NO_DOCUMENT: 'panNoDocument'
} as const;

export const WIREMAN_FORM_FIELDS = {
  FULL_NAME: 'fullName',
  LICENCE_NO: 'licenceNo',
  LICENCE_VALID_UPTO: 'licenceValidUpto',
  PAN_NO: 'panNo',
  DISTRICT_REF_ID: 'districtRefId',
  TEHSIL_REF_ID: 'tehsilRefId',
  LICENCE_DOCUMENT: 'licenceDocument',
  PAN_NO_DOCUMENT: 'panNoDocument'
} as const;

// Default form states
export const EMPTY_SUPERVISOR_FORM: SupervisorFormData = {
  fullName: '',
  licenceNo: '',
  licenceValidUpto: '',
  panNo: '',
  licenceDocument: '',
  panNoDocument: '',
  districtRefId: '',
  tehsilRefId: ''
};

export const EMPTY_WIREMAN_FORM: WiremanFormData = {
  fullName: '',
  licenceNo: '',
  licenceValidUpto: '',
  panNo: '',
  licenceDocument: '',
  panNoDocument: '',
  districtRefId: '',
  tehsilRefId: ''
};
