import { useState, useCallback } from 'react';
import type { SupervisorData, WiremanData } from '../types/supervisor.types';

export const useSupervisorData = () => {
  // Dummy data for initial state
  const [supervisorsList, setSupervisorsList] = useState<SupervisorData[]>([
    {
      id: 1,
      fullName: 'John Doe',
      licenceNo: 'SUP001',
      licenceValidUpto: '2025-12-31',
      panNo: 'ABCDE1234F',
      districtRefId: 1,
      districtName: 'Ludhiana',
      tehsilRefId: 1,
      tehsilName: 'Ludhiana',
      isOnline: true,
      licenceDocument: '',
      panNoDocument: '',
      contractorLicenceRefId: 1
    }
  ]);

  const [wiremansList, setWiremansList] = useState<WiremanData[]>([
    {
      id: 1,
      fullName: 'Mike Wilson',
      licenceNo: 'WIR001',
      licenceValidUpto: '2025-12-31',
      panNo: 'KLMNO9012P',
      districtRefId: 1,
      districtName: 'Ludhiana',
      tehsilRefId: 1,
      tehsilName: 'Ludhiana',
      isOnline: true,
      licenceDocument: '',
      panNoDocument: '',
      contractorLicenceRefId: 1
    }
  ]);

  // Loading states
  const [isAddingSupervisor, setIsAddingSupervisor] = useState(false);
  const [isAddingWireman, setIsAddingWireman] = useState(false);

  // Add supervisor
  const addSupervisor = useCallback((supervisorData: Omit<SupervisorData, 'id'>) => {
    const newSupervisor: SupervisorData = {
      ...supervisorData,
      id: Date.now() // Generate temporary ID
    };
    setSupervisorsList(prev => [...prev, newSupervisor]);
  }, []);

  // Add wireman
  const addWireman = useCallback((wiremanData: Omit<WiremanData, 'id'>) => {
    const newWireman: WiremanData = {
      ...wiremanData,
      id: Date.now() // Generate temporary ID
    };
    setWiremansList(prev => [...prev, newWireman]);
  }, []);

  // Delete supervisor
  const deleteSupervisor = useCallback((id: number) => {
    setSupervisorsList(prev => prev.filter(supervisor => supervisor.id !== id));
  }, []);

  // Delete wireman
  const deleteWireman = useCallback((id: number) => {
    setWiremansList(prev => prev.filter(wireman => wireman.id !== id));
  }, []);

  // Clear all data
  const clearSupervisors = useCallback(() => {
    setSupervisorsList([]);
  }, []);

  const clearWiremen = useCallback(() => {
    setWiremansList([]);
  }, []);

  return {
    // Data
    supervisorsList,
    wiremansList,
    
    // Loading states
    isAddingSupervisor,
    isAddingWireman,
    setIsAddingSupervisor,
    setIsAddingWireman,
    
    // Actions
    addSupervisor,
    addWireman,
    deleteSupervisor,
    deleteWireman,
    clearSupervisors,
    clearWiremen,
    
    // Direct setters (for complex operations)
    setSupervisorsList,
    setWiremansList
  };
};
