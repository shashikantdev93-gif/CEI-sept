/**
 * Supervisor API Service
 * Phase 2 - Modular Architecture
 * 
 * Centralized API service for all supervisor-related operations
 */

import { applicationServices } from '../../../services/api/applicationServices';
import type { 
  SupervisorApiResponse 
} from '../types';
import type {
  SupervisorData,
  WiremanData
} from '../../../types/supervisor.types';

class SupervisorApiService {
  /**
   * Load existing supervisors and wiremans for an application
   */
  async loadSupervisorWiremanData(appRefId: number): Promise<{
    supervisors: SupervisorData[];
    wiremans: WiremanData[];
  }> {
    console.log('📊 [SUPERVISOR-API] Loading supervisor/wireman data for appRefId:', appRefId);
    
    try {
      const response = await applicationServices.getContractorWorkerDetails(appRefId);
      
      if (response?.data) {
        const supervisors = Array.isArray(response.data.supervisors) ? response.data.supervisors : [];
        const wiremans = Array.isArray(response.data.wiremans) ? response.data.wiremans : [];
        
        console.log('✅ [SUPERVISOR-API] Loaded supervisors:', supervisors.length);
        console.log('✅ [SUPERVISOR-API] Loaded wiremans:', wiremans.length);
        
        return { supervisors, wiremans };
      }
      
      console.log('⚠️ [SUPERVISOR-API] No data returned from API');
      return { supervisors: [], wiremans: [] };
      
    } catch (error) {
      console.error('❌ [SUPERVISOR-API] Error loading data:', error);
      throw error;
    }
  }

  /**
   * Add a new supervisor
   */
  async addSupervisor(
    appRefId: number,
    supervisorData: any
  ): Promise<SupervisorApiResponse> {
    console.log('📊 [SUPERVISOR-API] Adding supervisor for appRefId:', appRefId);
    
    try {
      const response = await applicationServices.addUpdateContractSupervisor(supervisorData);
      
      console.log('✅ [SUPERVISOR-API] Supervisor added successfully');
      return response;
      
    } catch (error) {
      console.error('❌ [SUPERVISOR-API] Error adding supervisor:', error);
      throw error;
    }
  }

  /**
   * Add a new wireman
   */
  async addWireman(
    appRefId: number,
    wiremanData: any
  ): Promise<SupervisorApiResponse> {
    console.log('📊 [SUPERVISOR-API] Adding wireman for appRefId:', appRefId);
    
    try {
      const response = await applicationServices.addUpdateContractWireman(wiremanData);
      
      console.log('✅ [SUPERVISOR-API] Wireman added successfully');
      return response;
      
    } catch (error) {
      console.error('❌ [SUPERVISOR-API] Error adding wireman:', error);
      throw error;
    }
  }

  /**
   * Delete a supervisor
   */
  async deleteSupervisor(supervisorId: number): Promise<SupervisorApiResponse> {
    console.log('📊 [SUPERVISOR-API] Deleting supervisor ID:', supervisorId);
    
    try {
      const response = await applicationServices.deleteContractSupervisor(supervisorId);
      
      console.log('✅ [SUPERVISOR-API] Supervisor deleted successfully');
      return response;
      
    } catch (error) {
      console.error('❌ [SUPERVISOR-API] Error deleting supervisor:', error);
      throw error;
    }
  }

  /**
   * Delete a wireman
   */
  async deleteWireman(wiremanId: number): Promise<SupervisorApiResponse> {
    console.log('📊 [SUPERVISOR-API] Deleting wireman ID:', wiremanId);
    
    try {
      const response = await applicationServices.deleteContractWireman(wiremanId);
      
      console.log('✅ [SUPERVISOR-API] Wireman deleted successfully');
      return response;
      
    } catch (error) {
      console.error('❌ [SUPERVISOR-API] Error deleting wireman:', error);
      throw error;
    }
  }

  /**
   * Refresh supervisor/wireman data after operations
   */
  async refreshSupervisorWiremanData(appRefId: number): Promise<{
    supervisors: SupervisorData[];
    wiremans: WiremanData[];
  }> {
    console.log('� [SUPERVISOR-API] Refreshing supervisor/wireman data for appRefId:', appRefId);
    
    // Use the same method as loading data
    return this.loadSupervisorWiremanData(appRefId);
  }
}

// Export singleton instance
export const supervisorApiService = new SupervisorApiService();