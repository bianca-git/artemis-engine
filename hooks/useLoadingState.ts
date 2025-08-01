import { useState, useCallback } from 'react';

/**
 * Generic loading state manager to eliminate DRY violations
 * Replaces repetitive loading state patterns across hooks
 */

export interface LoadingState {
  [key: string]: boolean;
}

export interface LoadingActions {
  setLoading: (key: string, loading: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  resetAll: () => void;
}

export function useLoadingState(initialState: LoadingState = {}): [LoadingState, LoadingActions] {
  const [loadingState, setLoadingState] = useState<LoadingState>(initialState);

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingState(prev => ({ ...prev, [key]: loading }));
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const isLoading = useCallback((key: string) => {
    return loadingState[key] || false;
  }, [loadingState]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingState).some(Boolean);
  }, [loadingState]);

  const resetAll = useCallback(() => {
    setLoadingState({});
  }, []);

  const actions: LoadingActions = {
    setLoading,
    startLoading,
    stopLoading,
    isLoading,
    isAnyLoading,
    resetAll,
  };

  return [loadingState, actions];
}

/**
 * Hook for managing a single loading state with message
 */
export function useLoadingWithMessage(initialLoading = false, initialMessage = '') {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [message, setMessage] = useState(initialMessage);

  const startLoading = useCallback((loadingMessage = '') => {
    setIsLoading(true);
    setMessage(loadingMessage);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setMessage('');
  }, []);

  const updateMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  return {
    isLoading,
    message,
    startLoading,
    stopLoading,
    updateMessage,
    setIsLoading,
    setMessage,
  };
}