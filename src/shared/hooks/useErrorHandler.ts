/**
 * Error Handler Hook
 * Centralized error handling with consistent logging and user notification patterns
 * 
 * Usage:
 * const { handleError, clearError, error, showError } = useErrorHandler();
 */

import { useState, useCallback } from 'react';

export interface ErrorInfo {
  message: string;
  code?: string | number;
  details?: any;
  timestamp: Date;
}

export interface UseErrorHandlerOptions {
  logErrors?: boolean;
  showToast?: boolean;
  onError?: (error: ErrorInfo) => void;
}

export interface UseErrorHandlerReturn {
  error: ErrorInfo | null;
  showError: boolean;
  handleError: (error: any, context?: string) => void;
  clearError: () => void;
  setError: (error: ErrorInfo | null) => void;
}

export const useErrorHandler = (
  options: UseErrorHandlerOptions = {}
): UseErrorHandlerReturn => {
  const { logErrors = true, onError } = options;
  
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [showError, setShowError] = useState(false);

  const handleError = useCallback((error: any, context?: string) => {
    const errorInfo: ErrorInfo = {
      message: error?.message || error?.toString() || 'Unknown error occurred',
      code: error?.code || error?.status,
      details: error?.response?.data || error?.stack,
      timestamp: new Date()
    };

    // Log error if enabled
    if (logErrors) {
      console.group(`🚨 Error Handler${context ? ` - ${context}` : ''}`);
      console.error('Error Message:', errorInfo.message);
      console.error('Error Code:', errorInfo.code);
      console.error('Error Details:', errorInfo.details);
      console.error('Original Error:', error);
      console.groupEnd();
    }

    // Set error state
    setError(errorInfo);
    setShowError(true);

    // Call custom error handler if provided
    if (onError) {
      onError(errorInfo);
    }
  }, [logErrors, onError]);

  const clearError = useCallback(() => {
    setError(null);
    setShowError(false);
  }, []);

  const setErrorState = useCallback((error: ErrorInfo | null) => {
    setError(error);
    setShowError(!!error);
  }, []);

  return {
    error,
    showError,
    handleError,
    clearError,
    setError: setErrorState
  };
};

export default useErrorHandler;