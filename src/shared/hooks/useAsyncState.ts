/**
 * Async State Management Hook
 * Consolidated approach for handling async operations with loading, error, and data states
 * 
 * Usage:
 * const { data, isLoading, error, execute } = useAsyncState(asyncFunction);
 */

import { useState, useCallback } from 'react';

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseAsyncStateReturn<T> extends AsyncState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

export const useAsyncState = <T = any>(
  asyncFunction?: (...args: any[]) => Promise<T>
): UseAsyncStateReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    if (!asyncFunction) {
      console.warn('useAsyncState: No async function provided');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      setError(errorMessage);
      console.error('useAsyncState error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
    setData,
    setError
  };
};

export default useAsyncState;