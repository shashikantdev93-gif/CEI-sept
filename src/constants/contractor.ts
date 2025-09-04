export const CONTRACTOR_TYPES = [
  'Individual',
  'Private Limited',
  'Public Limited',
  'Partnership',
  'Proprietorship'
] as const;

export const VOLTAGE_TYPES = [
  'Low/Medium Voltage',
  'High Voltage',
  'Extra High Voltage'
] as const;

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

export const RANGE_UNITS = [
  { value: 'V', label: 'Volts (V)', id: 1 },
  { value: 'A', label: 'Amperes (A)', id: 2 },
  { value: 'Ω', label: 'Ohms (Ω)', id: 3 },
  { value: 'MΩ', label: 'Mega Ohm (MΩ)', id: 4 },
  { value: 'KV', label: 'Kilo Volt (KV)', id: 5 }
];

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