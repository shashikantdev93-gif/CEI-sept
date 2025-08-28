
import { axiosInterceptor } from '../lib/interceptor';

export interface State {
  id: number;
  name: string;
  code: string;
}

export interface District {
  districtCode: number;
  districtName: string;
  stateId: number;
  isActive?: boolean;
}

export interface Tehsil {
  tehsilId: number;
  tehsilName: string;
  districtId: number;
}

export interface LocationApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export class LocationService {
  
  static async getStates(): Promise<LocationApiResponse<State[]>> {
    try {
      const punjabState: State = {
        id: 3,
        name: 'Punjab',
        code: 'PB'
      };
      
      return {
        success: true,
        data: [punjabState]
      };
    } catch (error) {
      console.error('💥 [LOCATION-SERVICE] Error getting states:', error);
      const punjabState: State = {
        id: 3,
        name: 'Punjab',
        code: 'PB'
      };
      
      return {
        success: false,
        data: [punjabState],
        error: 'Failed to fetch states'
      };
    }
  }

static async getDistrictsByStateId(stateId: number): Promise<LocationApiResponse<District[]>> {
    try {
      const response = await axiosInterceptor.get('/CommonApis/getalldistrict');
      
      let districtsArray = [];
      
      if (Array.isArray(response)) {
        districtsArray = response;
      } else if (response.data && Array.isArray(response.data)) {
        districtsArray = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        districtsArray = response.data;
      }
      
      if (districtsArray.length > 0) {
        const districts: District[] = districtsArray.map((item: any) => ({
          districtCode: item.districtCode || item.districtRefId || item.id,
          districtName: item.districtName || item.name,
          stateId: stateId
        }));
        
        return {
          success: true,
          data: districts
        };
      } else {
        return {
          success: false,
          data: [],
          error: 'No districts found'
        };
      }
    } catch (error) {
      console.error('💥 [LOCATION-SERVICE] Error getting districts:', error);
      return {
        success: false,
        data: [],
        error: 'Failed to fetch districts'
      };
    }
  }

static async getTehsilsByDistrictId(districtId: number): Promise<LocationApiResponse<Tehsil[]>> {
    try {
      const response = await axiosInterceptor.get(`/CommonApis/gettehsilsbydistrictrefid?id=${districtId}`);
      
      let tehsilsArray = [];
      
      if (Array.isArray(response)) {
        tehsilsArray = response;
      } else if (response.data && Array.isArray(response.data)) {
        tehsilsArray = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        tehsilsArray = response.data;
      }
      
      if (tehsilsArray.length > 0) {
        const tehsils: Tehsil[] = tehsilsArray.map((item: any) => ({
          tehsilId: item.tehsilId || item.tehsilRefId || item.id,
          tehsilName: item.tehsilName || item.name,
          districtId: districtId
        }));
        
        return {
          success: true,
          data: tehsils
        };
      } else {
        return {
          success: false,
          data: [],
          error: 'No tehsils found for this district'
        };
      }
    } catch (error) {
      console.error('💥 [LOCATION-SERVICE] Error getting tehsils:', error);
      return {
        success: false,
        data: [],
        error: 'Failed to fetch tehsils'
      };
    }
  }

static validatePincode(pincode: string): { isValid: boolean; error?: string } {
    const cleanPincode = pincode.replace(/\s+/g, '');
    
    if (!/^\d{6}$/.test(cleanPincode)) {
      return {
        isValid: false,
        error: 'Pincode must be exactly 6 digits'
      };
    }
    
    const firstDigit = parseInt(cleanPincode.charAt(0));
    if (firstDigit === 0) {
      return {
        isValid: false,
        error: 'Invalid pincode format'
      };
    }
    
    const pincodeNum = parseInt(cleanPincode);
    
    if (pincodeNum >= 110001 && pincodeNum <= 999999) {
      return { isValid: true };
    }
    
    return {
      isValid: false,
      error: 'Please enter a valid Indian pincode'
    };
  }

static async getLocationByPincode(pincode: string): Promise<LocationApiResponse<any>> {
    const validation = this.validatePincode(pincode);
    
    if (!validation.isValid) {
      return {
        success: false,
        data: null,
        error: validation.error
      };
    }
    
    return {
      success: true,
      data: {
        pincode: pincode,
        isValid: true
      }
    };
  }
}

export default LocationService;
