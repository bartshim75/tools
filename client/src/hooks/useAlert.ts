import { useState, useCallback } from 'react';
import type { AlertState } from '../types/index.js';

export const useAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    show: false,
    message: '',
    type: 'success'
  });

  const showAlert = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setAlertState({
      show: true,
      message,
      type
    });
    
    // 3초 후 자동 닫기
    setTimeout(() => {
      setAlertState(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, show: false }));
  }, []);

  return {
    alertState,
    showAlert,
    hideAlert
  };
}; 