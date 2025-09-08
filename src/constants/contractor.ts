/**
 * Contractor Constants and Mappings
 * 
 * This file contains all contractor-related constants and mapping functions
 * that match the Angular backend implementation. The mappings ensure proper
 * data transformation between the React frontend and the API.
 * 
 * Key Features:
 * - Contractor type mappings (string ↔ number)
 * - Voltage type mappings (string ↔ number) 
 * - Instrument lists based on voltage type
 * - Range unit mappings (string ↔ number)
 * - Error and success message constants
 */

// Combined contractor types with mappings
export const CONTRACTOR_TYPE_CONFIG = [
  { id: 1, name: "Proprietorship" },
  { id: 2, name: "Partnership" },
  { id: 3, name: "Individual" },
  { id: 4, name: "Public Limited" },
  { id: 5, name: "Private Limited" }
] as const;

// Derived arrays and mappings
export const CONTRACTOR_TYPES = CONTRACTOR_TYPE_CONFIG.map(item => item.name);
export const CONTRACTOR_TYPE_MAPPING = Object.fromEntries(
  CONTRACTOR_TYPE_CONFIG.map(item => [item.name, item.id])
) as Record<string, number>;
export const CONTRACTOR_TYPE_REVERSE_MAPPING = Object.fromEntries(
  CONTRACTOR_TYPE_CONFIG.map(item => [item.id, item.name])
) as Record<number, string>;

// Combined voltage types with mappings
export const VOLTAGE_TYPE_CONFIG = [
  { id: 1, name: "Low/Medium Voltage" },
  { id: 2, name: "High Voltage" },
  { id: 3, name: "Extra High Voltage" }
] as const;

// Derived arrays and mappings
export const VOLTAGE_TYPES = VOLTAGE_TYPE_CONFIG.map(item => item.name);
export const VOLTAGE_TYPE_MAPPING = Object.fromEntries(
  VOLTAGE_TYPE_CONFIG.map(item => [item.name, item.id])
) as Record<string, number>;
export const VOLTAGE_TYPE_REVERSE_MAPPING = Object.fromEntries(
  VOLTAGE_TYPE_CONFIG.map(item => [item.id, item.name])
) as Record<number, string>;

// Combined range units with mappings
export const RANGE_UNIT_CONFIG = [
  { id: 1, value: 'V', label: 'Volts (V)' },
  { id: 2, value: 'A', label: 'Amperes (A)' },
  { id: 3, value: 'Ω', label: 'Ohms (Ω)' },
  { id: 4, value: 'MΩ', label: 'Mega Ohm (MΩ)' },
  { id: 5, value: 'KV', label: 'Kilo Volt (KV)' }
] as const;

// Derived arrays and mappings
export const RANGE_UNITS = RANGE_UNIT_CONFIG;
export const RANGE_UNIT_MAPPING = Object.fromEntries(
  RANGE_UNIT_CONFIG.map(item => [item.value, item.id])
) as Record<string, number>;
export const RANGE_UNIT_REVERSE_MAPPING = Object.fromEntries(
  RANGE_UNIT_CONFIG.map(item => [item.id, item.value])
) as Record<number, string>;

export const INSTRUMENT_LISTS = {
  lowMediumVoltage: [
    { value: 1, name: "Earth resistance tester" },
    { value: 2, name: "Tong tester" },
    { value: 3, name: "Multimeter" },
    { value: 4, name: "Insulation tester of 500 volts" }
  ],
  highVoltage: [
    { value: 5, name: "Earth resistance tester" },
    { value: 6, name: "Tong tester" },
    { value: 7, name: "Multimeter" },
    { value: 8, name: "Insulation tester of 500 volts" },
    { value: 9, name: "Insulation tester of 2500 volts (Only for High Voltage contractors)" }
  ],
  extraHighVoltage: [
    { value: 10, name: "Earth resistance tester" },
    { value: 11, name: "Tong tester" },
    { value: 12, name: "Multimeter" },
    { value: 13, name: "Insulation tester of 500 volts" },
    { value: 14, name: "Insulation tester of 2500 volts (Only for High Voltage contractors)" },
    { value: 15, name: "Insulation tester of 5000 volts (Only for Extra High Voltage contractors)" },
    { value: 16, name: "Machine for testing of B.D.voltage value of Transformer oil" }
  ]
};

export const WORKING_AREA_ERRORS = {
  DUPLICATE_AREA: 'Oops! This working area was already added',
  DISTRICT_REQUIRED: 'District is required',
  TEHSIL_REQUIRED: 'Tehsil is required',
  APPLICATION_CREATE_FAILED: 'Failed to create application. Please try again.',
  ADD_FAILED: 'Failed to add working area. Please try again.'
} as const;

export const WORKING_AREA_SUCCESS_MESSAGES = {
  AREA_ADDED: 'Working area added successfully!',
  APPLICATION_CREATED: 'Application created successfully'
} as const;

// Utility functions for mapping (similar to Angular usage)
export const getContractorTypeEnum = (type: number): string => {
  return CONTRACTOR_TYPE_REVERSE_MAPPING[type] || "Unknown";
};

export const getVoltageTypeEnum = (type: number): string => {
  return VOLTAGE_TYPE_REVERSE_MAPPING[type] || "Unknown";
};

export const getRangeUnitEnum = (type: number): string => {
  return RANGE_UNIT_REVERSE_MAPPING[type] || "Unknown";
};

// Helper functions for form operations (similar to Angular)
export const getContractorTypeId = (name: string): number => {
  return CONTRACTOR_TYPE_MAPPING[name] || 0;
};

export const getVoltageTypeId = (name: string): number => {
  return VOLTAGE_TYPE_MAPPING[name] || 0;
};

export const getRangeUnitId = (value: string): number => {
  return RANGE_UNIT_MAPPING[value] || 0;
};