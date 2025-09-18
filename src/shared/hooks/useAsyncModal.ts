/**
 * Combined Async Modal Hook
 * Combines useAsyncState and useModalState for common patterns like
 * opening modals that need to load data asynchronously
 * 
 * Usage:
 * const { isOpen, data, isLoading, error, openModalWithData, closeModal } = useAsyncModal(loadDataFunction);
 */

import { useCallback } from 'react';
import { useAsyncState } from './useAsyncState';
import { useModalState } from './useModalState';

export interface UseAsyncModalReturn<T> {
  // Modal state
  isOpen: boolean;
  closeModal: () => void;
  toggleModal: () => void;
  
  // Async state
  data: T | null;
  isLoading: boolean;
  error: string | null;
  
  // Combined operations
  openModal: (data?: T) => void;
  openModalWithData: (...args: any[]) => Promise<void>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

export const useAsyncModal = <T = any>(
  asyncFunction?: (...args: any[]) => Promise<T>
): UseAsyncModalReturn<T> => {
  const modalState = useModalState<T>();
  const asyncState = useAsyncState<T>(asyncFunction);

  const openModalWithData = useCallback(async (...args: any[]) => {
    modalState.openModal();
    const result = await asyncState.execute(...args);
    
    if (result) {
      modalState.setData(result);
    }
  }, [modalState, asyncState]);

  const closeModal = useCallback(() => {
    modalState.closeModal();
    asyncState.reset();
  }, [modalState, asyncState]);

  const reset = useCallback(() => {
    asyncState.reset();
    modalState.setData(null);
  }, [asyncState, modalState]);

  const setData = useCallback((data: T | null) => {
    asyncState.setData(data);
    modalState.setData(data);
  }, [asyncState, modalState]);

  return {
    // Modal state
    isOpen: modalState.isOpen,
    closeModal,
    toggleModal: modalState.toggleModal,
    
    // Async state
    data: asyncState.data || modalState.data,
    isLoading: asyncState.isLoading,
    error: asyncState.error,
    
    // Combined operations
    openModal: modalState.openModal,
    openModalWithData,
    reset,
    setData,
    setError: asyncState.setError
  };
};

export default useAsyncModal;