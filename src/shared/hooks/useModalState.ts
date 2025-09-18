/**
 * Modal State Management Hook
 * Standardized approach for managing modal visibility and data passing
 * 
 * Usage:
 * const { isOpen, data, openModal, closeModal } = useModalState();
 */

import { useState, useCallback } from 'react';

export interface UseModalStateReturn<T = any> {
  isOpen: boolean;
  data: T | null;
  openModal: (data?: T) => void;
  closeModal: () => void;
  toggleModal: () => void;
  setData: (data: T | null) => void;
}

export const useModalState = <T = any>(
  initialOpen = false,
  initialData: T | null = null
): UseModalStateReturn<T> => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState<T | null>(initialData);

  const openModal = useCallback((modalData?: T) => {
    if (modalData !== undefined) {
      setData(modalData);
    }
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Optionally clear data when closing (can be changed based on needs)
    // setData(null);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    data,
    openModal,
    closeModal,
    toggleModal,
    setData
  };
};

export default useModalState;