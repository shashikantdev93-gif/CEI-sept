
import { useState, useCallback } from 'react';
import { LocationService } from '../utils/locationService';
import type { State, District, Tehsil } from '../utils/locationService';

interface LocationState {
  states: State[];
  districts: District[];
  tehsils: Tehsil[];
  loading: {
    states: boolean;
    districts: boolean;
    tehsils: boolean;
    pincode: boolean;
  };
  errors: {
    states?: string;
    districts?: string;
    tehsils?: string;
    pincode?: string;
  };
}

interface PincodeValidation {
  isValid: boolean;
  error?: string;
  isValidating: boolean;
}

export const useLocation = () => {
  const [locationState, setLocationState] = useState<LocationState>({
    states: [],
    districts: [],
    tehsils: [],
    loading: {
      states: false,
      districts: false,
      tehsils: false,
      pincode: false
    },
    errors: {}
  });

  const [pincodeValidation, setPincodeValidation] = useState<PincodeValidation>({
    isValid: false,
    isValidating: false
  });

const loadDistricts = useCallback(async (stateId: number) => {
    setLocationState(prev => ({
      ...prev,
      districts: [],
      tehsils: [],
      loading: { ...prev.loading, districts: true },
      errors: { ...prev.errors, districts: undefined, tehsils: undefined }
    }));

    try {
      const response = await LocationService.getDistrictsByStateId(stateId);
      
      if (response.success) {
        setLocationState(prev => ({
          ...prev,
          districts: response.data,
          loading: { ...prev.loading, districts: false }
        }));
      } else {
        console.error('❌ [USE-LOCATION] Failed to load districts:', response.error);
        setLocationState(prev => ({
          ...prev,
          loading: { ...prev.loading, districts: false },
          errors: { ...prev.errors, districts: response.error }
        }));
      }
    } catch (error) {
      console.error('💥 [USE-LOCATION] Exception loading districts:', error);
      setLocationState(prev => ({
        ...prev,
        loading: { ...prev.loading, districts: false },
        errors: { ...prev.errors, districts: 'Failed to load districts' }
      }));
    }
  }, []);

const loadTehsils = useCallback(async (districtId: number) => {
    setLocationState(prev => ({
      ...prev,
      tehsils: [],
      loading: { ...prev.loading, tehsils: true },
      errors: { ...prev.errors, tehsils: undefined }
    }));

    try {
      const response = await LocationService.getTehsilsByDistrictId(districtId);
      
      if (response.success) {
        setLocationState(prev => ({
          ...prev,
          tehsils: response.data,
          loading: { ...prev.loading, tehsils: false }
        }));
      } else {
        console.error('❌ [USE-LOCATION] Failed to load tehsils:', response.error);
        setLocationState(prev => ({
          ...prev,
          loading: { ...prev.loading, tehsils: false },
          errors: { ...prev.errors, tehsils: response.error }
        }));
      }
    } catch (error) {
      console.error('💥 [USE-LOCATION] Exception loading tehsils:', error);
      setLocationState(prev => ({
        ...prev,
        loading: { ...prev.loading, tehsils: false },
        errors: { ...prev.errors, tehsils: 'Failed to load tehsils' }
      }));
    }
  }, []);

const validatePincode = useCallback(async (pincode: string) => {
    if (!pincode || pincode.length < 6) {
      setPincodeValidation({
        isValid: false,
        isValidating: false
      });
      return;
    }

    setPincodeValidation(prev => ({
      ...prev,
      isValidating: true
    }));

    try {
      const response = await LocationService.getLocationByPincode(pincode);
      
      if (response.success) {
        setPincodeValidation({
          isValid: true,
          isValidating: false
        });
      } else {
        setPincodeValidation({
          isValid: false,
          error: response.error,
          isValidating: false
        });
      }
    } catch (error) {
      console.error('💥 [USE-LOCATION] Exception validating pincode:', error);
      setPincodeValidation({
        isValid: false,
        error: 'Failed to validate pincode',
        isValidating: false
      });
    }
  }, []);

const resetSubLocations = useCallback(() => {
    setLocationState(prev => ({
      ...prev,
      districts: [],
      tehsils: [],
      errors: {
        ...prev.errors,
        districts: undefined,
        tehsils: undefined
      }
    }));
  }, []);

const resetTehsils = useCallback(() => {
    setLocationState(prev => ({
      ...prev,
      tehsils: [],
      errors: {
        ...prev.errors,
        tehsils: undefined
      }
    }));
  }, []);

  return {
    states: locationState.states,
    districts: locationState.districts,
    tehsils: locationState.tehsils,
    
    loading: locationState.loading,
    
    errors: locationState.errors,
    
    pincodeValidation,

loadDistricts,
    loadTehsils,
    validatePincode,
    resetSubLocations,
    resetTehsils
  };
};

export default useLocation;
