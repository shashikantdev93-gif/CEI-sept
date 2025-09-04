import type { WorkingArea, Instrument, Partner, InstrumentPayload, PartnerPayload, WorkingAreaPayload } from '../types/contractor.types';
import { INSTRUMENT_LISTS, RANGE_UNITS } from '../constants/contractor';


export interface WorkingAreaDuplicateCheck {
  districtRefId: number;
  tehsilRefId: number;
  districtName: string;
  tehsilName: string;
}

export const validateWorkingAreaDuplicate = (
  newDistrictId: number,
  newTehsilId: number,
  existingWorkingAreas: WorkingArea[],
  districts: Array<{districtCode: number, districtName: string}>,
  tehsils: Array<{tehsilId: number, tehsilName: string}>
): { isDuplicate: boolean; duplicateArea?: WorkingAreaDuplicateCheck } => {
  console.log('🔍 [DUPLICATE-CHECK] Checking for duplicate working area');
  console.log('🔍 [DUPLICATE-CHECK] New area - District:', newDistrictId, 'Tehsil:', newTehsilId);
  console.log('🔍 [DUPLICATE-CHECK] Existing areas count:', existingWorkingAreas.length);

  const newDistrictName = districts.find(d => d.districtCode === newDistrictId)?.districtName;
  const newTehsilName = tehsils.find(t => t.tehsilId === newTehsilId)?.tehsilName;

  // Check if this exact combination exists
  const isDuplicate = existingWorkingAreas.some(area => {
    const areaDistrictMatch = area.district === newDistrictName;
    const areaTehsilMatch = area.tehsil === newTehsilName;
    
    console.log('🔍 [DUPLICATE-CHECK] Comparing with existing:', {
      existing: `${area.district} - ${area.tehsil}`,
      new: `${newDistrictName} - ${newTehsilName}`,
      districtMatch: areaDistrictMatch,
      tehsilMatch: areaTehsilMatch
    });
    
    return areaDistrictMatch && areaTehsilMatch;
  });

  if (isDuplicate) {
    console.log('⚠️ [DUPLICATE-CHECK] Duplicate found!');
    return {
      isDuplicate: true,
      duplicateArea: {
        districtRefId: newDistrictId,
        tehsilRefId: newTehsilId,
        districtName: newDistrictName || '',
        tehsilName: newTehsilName || ''
      }
    };
  }

  console.log('✅ [DUPLICATE-CHECK] No duplicate found');
  return { isDuplicate: false };
};

// Enhanced payload creation with validation
export const createWorkingAreaPayload = (
  applicationId: number,
  districtRefId: number,
  tehsilRefId: number,
  districtName: string,
  tehsilName: string
): WorkingAreaPayload => {
  console.log('📦 [WORKING-AREA-UTILS] Creating working area payload');
  console.log('📦 [WORKING-AREA-UTILS] Input parameters:', {
    applicationId,
    districtRefId,
    tehsilRefId,
    districtName,
    tehsilName
  });
  
  // Validate required fields
  if (!applicationId || applicationId <= 0) {
    throw new Error('Invalid application ID');
  }
  
  if (!districtRefId || districtRefId <= 0) {
    throw new Error('Invalid district reference ID');
  }
  
  if (!tehsilRefId || tehsilRefId <= 0) {
    throw new Error('Invalid tehsil reference ID');
  }
  
  if (!districtName || districtName.trim() === '') {
    throw new Error('District name is required');
  }
  
  if (!tehsilName || tehsilName.trim() === '') {
    throw new Error('Tehsil name is required');
  }
  
  // Create payload exactly matching Angular structure
  const payload: WorkingAreaPayload = {
    tehsilLevelUserMappingId: 0,                    // Always 0 for new entries (matches Angular)
    appRefId: applicationId,                        // Application reference ID
    districtRefId: districtRefId,                   // District reference ID (integer)
    tehsilRefId: tehsilRefId,                       // Tehsil reference ID (integer)
    createdOnDate: new Date().toISOString(),        // ISO timestamp
    lastModifiedOnDate: new Date().toISOString(),   // ISO timestamp
    districtName: districtName.trim(),              // District name (string)
    tehsilName: tehsilName.trim()                   // Tehsil name (string)
  };
  
  console.log('📦 [WORKING-AREA-UTILS] Final payload created:', payload);
  return payload;
};

export const getInstrumentListByVoltage = (voltageType: string) => {
  switch (voltageType) {
    case "Low/Medium Voltage":
      return INSTRUMENT_LISTS.lowMediumVoltage;
    case "High Voltage":
      return INSTRUMENT_LISTS.highVoltage;
    case "Extra High Voltage":
      return INSTRUMENT_LISTS.extraHighVoltage;
    default:
      return [];
  }
};

export const validateInstrument = (instrumentData: Partial<Instrument>): string | null => {
  if (!instrumentData.instrumentType) return 'Instrument type is required';
  if (!instrumentData.instrumentSerialNo) return 'Serial number is required';
  if (!instrumentData.instrumentMake) return 'Instrument make is required';
  if (!instrumentData.district) return 'District is required';
  if (!instrumentData.tehsil) return 'Tehsil is required';
  return null;
};

export const validatePartner = (partnerData: Partial<Partner>): string | null => {
  if (!partnerData.name) return 'Partner name is required';
  if (!partnerData.email) return 'Partner email is required';
  if (!partnerData.mobileNumber) return 'Contact number is required';
  if (!partnerData.panNo) return 'PAN number is required';
  if (!partnerData.photo) return 'Partner photo is required';
  if (!partnerData.pan) return 'PAN document is required';
  return null;
};

export const createInstrumentPayload = (data: any): InstrumentPayload => {
  return {
    contactInstrumentId: 0,
    appRefId: data.applicationId,
    applicationInstrumentsType: data.instrumentType,
    instrumentSerialNo: data.serialNo.toUpperCase(),
    instrumentMakeBy: data.make,
    instrumentStartRange: data.rangeFrom,
    instrumentEndRange: data.rangeTo,
    applicationInstrumentRange: RANGE_UNITS.find(u => u.value === data.rangeUnit)?.id || 1,
    isActive: true,
    isDeleted: false,
    createdOnDate: new Date().toISOString(),
    lastModifiedOnDate: new Date().toISOString(),
    districtRefId: data.district,
    districtName: data.districtName,
    tehsilRefId: data.tehsil,
    tehsilName: data.tehsilName
  };
};

export const createPartnerPayload = (data: any): PartnerPayload => {
  return {
    contactPartnershipId: 0,
    appRefId: data.applicationId,
    contrPartnerName: data.name,
    contrPartnerEmail: data.email,
    contrPartnerContactNo: data.contactNumber,
    contrPartnerPhoto: data.photo,
    panNoPhoto: data.panDoc,
    panNo: data.panNo,
    isActive: true,
    isDeleted: false,
    createdOnDate: new Date().toISOString(),
    lastModifiedOnDate: new Date().toISOString()
  };
};