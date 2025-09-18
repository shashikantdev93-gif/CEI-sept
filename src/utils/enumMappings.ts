/**
 * Enum mapping utilities to match Angular contractor form logic
 * These mappings convert backend numeric IDs to display names
 */

export const getInstrumentTypeName = (instrumentTypeId: number): string => {
  // Match Angular ApplicationInstrumentsTypeEnum exactly
  const instrumentTypes: { [key: number]: string } = {
    0: "N/A",
    1: "Earth resistance tester",
    2: "Tong tester", 
    3: "Multimeter",
    4: "Insulation tester of 500 volts",
    5: "Insulation tester of 2500 volts (Only for High Voltage contractors)",
    6: "Insulation tester of 5000 volts (Only for Extra High Voltage contractors)",
    7: "Machine for testing of B.D. voltage value of Transformer oil"
  };
  
  return instrumentTypes[instrumentTypeId] || "Unknown";
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

export const getRangeUnitName = (rangeUnitId: string | number): string => {
  // Match Angular InstrumentRangeEnum exactly
  const rangeUnits: { [key: string]: string } = {
    "1": "Volt (V)",
    "2": "Amp (A)", 
    "3": "Ohm (Ω)",
    "4": "Mega Ohm (MΩ)",
    "5": "Kilo Volt (KV)"
  };
  
  return rangeUnits[String(rangeUnitId)] || "Unknown";
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
