/**
 * Contractor Module Types
 * Phase 2 - Module Refactoring
 * 
 * Type definitions for the contractor module
 */

export interface ContractorFormData {
  // Basic applicant details
  firstName: string;
  lastName: string;
  middleName?: string;
  fatherName: string;
  email: string;
  mobileNo: string;
  address: string;
  district: string;
  tehsil: string;
  pinCode: string;
  
  // Company details
  companyName: string;
  contractorType: string;
  registrationNumber: string;
  
  // Additional details
  dateOfBirth?: string;
  photo?: string;
  signature?: string;
  
  // Related entities
  workingAreas: WorkingArea[];
  partners: Partner[];
  instruments: Instrument[];
}

export interface WorkingArea {
  id: string;
  areaName: string;
  district: string;
  tehsil: string;
  voltage: string;
  [key: string]: any;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  [key: string]: any;
}

export interface Instrument {
  id: string;
  instrumentType: string;
  instrumentSerialNo: string;
  instrumentMake: string;
  instrumentRange: string;
  district: string;
  tehsil: string;
  [key: string]: any;
}

export interface ContractorApplicationStep {
  id: number;
  title: string;
  component: string;
  isCompleted: boolean;
  isActive: boolean;
}