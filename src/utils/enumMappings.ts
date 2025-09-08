/**
 * Enum mapping utilities to match Angular contractor form logic
 * These mappings convert backend numeric IDs to display names
 */

export const getInstrumentTypeName = (instrumentTypeId: number): string => {
  const instrumentTypes: { [key: number]: string } = {
    1: "Multimeter",
    2: "Earth Tester", 
    3: "Insulation Tester",
    4: "Clamp Meter",
    5: "Phase Sequence Meter",
    6: "Continuity Tester",
    7: "Power Quality Analyzer",
    8: "Oscilloscope",
    9: "Function Generator",
    10: "High Voltage Tester",
    11: "Relay Test Set",
    12: "Primary Injection Test Set",
    13: "Secondary Injection Test Set",
    14: "Transformer Turn Ratio Tester",
    15: "Circuit Breaker Analyzer",
    16: "Power Factor Meter",
    17: "Harmonic Analyzer",
    18: "Load Flow Analysis Software",
    19: "Short Circuit Analysis Software",
    20: "SF6 Gas Analyzer",
    21: "Partial Discharge Detector",
    22: "Tan Delta Test Set",
    23: "VLF Test Set",
    24: "Cable Fault Locator",
    25: "Thyristor Analyzer"
  };
  
  return instrumentTypes[instrumentTypeId] || `Unknown Instrument (${instrumentTypeId})`;
};

export const getContractorTypeName = (typeId: number): string => {
  const contractorTypes: { [key: number]: string } = {
    1: "Proprietorship",
    2: "Partnership",
    3: "Individual", 
    4: "Public Limited",
    5: "Private Limited"
  };
  
  return contractorTypes[typeId] || `Unknown Type (${typeId})`;
};

export const getVoltageTypeName = (voltageId: number): string => {
  const voltageTypes: { [key: number]: string } = {
    1: "Low/Medium Voltage",
    2: "High Voltage",
    3: "Extra High Voltage"
  };
  
  return voltageTypes[voltageId] || `Unknown Voltage (${voltageId})`;
};

export const getRangeUnitName = (rangeUnitId: number): string => {
  const rangeUnits: { [key: number]: string } = {
    1: "V",
    2: "A",
    3: "Ω",
    4: "Hz",
    5: "W",
    6: "VA",
    7: "VAR",
    8: "kV",
    9: "kA",
    10: "MΩ",
    11: "mA",
    12: "µA",
    13: "nA",
    14: "pF",
    15: "µF",
    16: "mF"
  };
  
  return rangeUnits[rangeUnitId] || "";
};

// Reverse mappings for form submissions
export const getContractorTypeId = (typeName: string): number => {
  const typeNameToId: { [key: string]: number } = {
    "Proprietorship": 1,
    "Partnership": 2,
    "Individual": 3,
    "Public Limited": 4,
    "Private Limited": 5
  };
  
  return typeNameToId[typeName] || 3; // Default to Individual
};

export const getVoltageTypeId = (voltageName: string): number => {
  const voltageNameToId: { [key: string]: number } = {
    "Low/Medium Voltage": 1,
    "High Voltage": 2,
    "Extra High Voltage": 3
  };
  
  return voltageNameToId[voltageName] || 1; // Default to Low/Medium
};
