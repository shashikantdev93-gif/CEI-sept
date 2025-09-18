/**
 * Contractor API Service - Phase 2 Refactoring
 * 
 * This service centralizes all contractor-related API calls
 * while maintaining the exact same response format as the original.
 */

import { applicationServices } from '../../../services/api/applicationServices';

export const contractorApiService = {
  /**
   * Get contractor application details by ID
   * ✅ Same API call and response format as original
   */
  getApplicationDetails: async (applicationId: number) => {
    console.log('📡 [CONTRACTOR-API] Fetching application details:', applicationId);
    
    try {
      const response = await applicationServices.getContractorApplicationDetailsById(applicationId);
      
      console.log('✅ [CONTRACTOR-API] Application details received:', response);
      return response;
    } catch (error) {
      console.error('❌ [CONTRACTOR-API] Failed to fetch application details:', error);
      throw error;
    }
  },

  /**
   * Add working area - same API as original
   */
  addWorkingArea: async (workingAreaData: any) => {
    console.log('📡 [CONTRACTOR-API] Adding working area:', workingAreaData);
    
    try {
      const response = await applicationServices.addWorkingArea(workingAreaData);
      console.log('✅ [CONTRACTOR-API] Working area added:', response);
      return response;
    } catch (error) {
      console.error('❌ [CONTRACTOR-API] Failed to add working area:', error);
      throw error;
    }
  },

  /**
   * Delete working area - same API as original
   */
  deleteWorkingArea: async (workingAreaId: number) => {
    console.log('📡 [CONTRACTOR-API] Deleting working area:', workingAreaId);
    
    try {
      const response = await applicationServices.deleteWorkingArea(workingAreaId);
      console.log('✅ [CONTRACTOR-API] Working area deleted:', response);
      return response;
    } catch (error) {
      console.error('❌ [CONTRACTOR-API] Failed to delete working area:', error);
      throw error;
    }
  },

  /**
   * Add instrument - same API as original
   */
  addInstrument: async (instrumentData: any) => {
    console.log('📡 [CONTRACTOR-API] Adding instrument:', instrumentData);
    
    try {
      const response = await applicationServices.addInstrument(instrumentData);
      console.log('✅ [CONTRACTOR-API] Instrument added:', response);
      return response;
    } catch (error) {
      console.error('❌ [CONTRACTOR-API] Failed to add instrument:', error);
      throw error;
    }
  },

  /**
   * Delete instrument - same API as original
   */
  deleteInstrument: async (instrumentId: number) => {
    console.log('📡 [CONTRACTOR-API] Deleting instrument:', instrumentId);
    
    try {
      const response = await applicationServices.deleteInstrument(instrumentId);
      console.log('✅ [CONTRACTOR-API] Instrument deleted:', response);
      return response;
    } catch (error) {
      console.error('❌ [CONTRACTOR-API] Failed to delete instrument:', error);
      throw error;
    }
  },

  /**
   * Add partner - same API as original
   */
  addPartner: async (partnerData: any) => {
    console.log('📡 [CONTRACTOR-API] Adding partner:', partnerData);
    
    try {
      const response = await applicationServices.addPartner(partnerData);
      console.log('✅ [CONTRACTOR-API] Partner added:', response);
      return response;
    } catch (error) {
      console.error('❌ [CONTRACTOR-API] Failed to add partner:', error);
      throw error;
    }
  },

  /**
   * Delete partner - same API as original
   */
  deletePartner: async (partnerId: number) => {
    console.log('📡 [CONTRACTOR-API] Deleting partner:', partnerId);
    
    try {
      const response = await applicationServices.deletePartner(partnerId);
      console.log('✅ [CONTRACTOR-API] Partner deleted:', response);
      return response;
    } catch (error) {
      console.error('❌ [CONTRACTOR-API] Failed to delete partner:', error);
      throw error;
    }
  },

  /**
   * Validate PAN number - same API as original
   */
  checkPANExists: async (panNumber: string) => {
    console.log('📡 [CONTRACTOR-API] Validating PAN:', panNumber);
    
    try {
      const response = await applicationServices.checkPANExists(panNumber);
      console.log('✅ [CONTRACTOR-API] PAN validation result:', response);
      return response;
    } catch (error) {
      console.error('❌ [CONTRACTOR-API] Failed to validate PAN:', error);
      throw error;
    }
  },

  /**
   * Validate instrument serial number - same API as original
   */
  validateInstrumentSerial: async (serialNumber: string) => {
    console.log('📡 [CONTRACTOR-API] Validating instrument serial:', serialNumber);
    
    try {
      const response = await applicationServices.validateInstrumentSerialNumber(serialNumber);
      console.log('✅ [CONTRACTOR-API] Instrument serial validation result:', response);
      return response;
    } catch (error) {
      console.error('❌ [CONTRACTOR-API] Failed to validate instrument serial:', error);
      throw error;
    }
  },

  /**
   * Save application as draft - same API as original
   */
  saveAsDraft: async (applicationData: any) => {
    console.log('📡 [CONTRACTOR-API] Saving as draft:', applicationData);
    
    try {
      // Use same API method as original
      const response = await applicationServices.saveContractorApplication(applicationData);
      console.log('✅ [CONTRACTOR-API] Draft saved:', response);
      return response;
    } catch (error) {
      console.error('❌ [CONTRACTOR-API] Failed to save draft:', error);
      throw error;
    }
  },

  /**
   * Submit final application - same API as original
   */
  submitApplication: async (applicationData: any) => {
    console.log('📡 [CONTRACTOR-API] Submitting final application:', applicationData);
    
    try {
      // Use same API method as original
      const response = await applicationServices.saveContractorApplication(applicationData);
      console.log('✅ [CONTRACTOR-API] Application submitted:', response);
      return response;
    } catch (error) {
      console.error('❌ [CONTRACTOR-API] Failed to submit application:', error);
      throw error;
    }
  }
};

export default contractorApiService;