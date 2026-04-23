import { useCallback, useRef } from 'react';
import { ToastRef } from '@uigovpe/components';

interface ToastConfig {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
  life?: number;
}

export const useToast = () => {
  const toast = useRef<ToastRef>(null);

  const showToast = useCallback((config: ToastConfig) => {
    toast.current?.show({
      severity: config.severity,
      icon: undefined,
      summary: config.summary,
      detail: config.detail,
      life: config.life || 3000,
    });
  }, []);

  const showSuccess = useCallback((summary: string, detail: string, life?: number) => {
    showToast({ severity: 'success', summary, detail, life });
  }, [showToast]);

  const showError = useCallback((summary: string, detail: string, life?: number) => {
    showToast({ severity: 'error', summary, detail, life });
  }, [showToast]);

  const showInfo = useCallback((summary: string, detail: string, life?: number) => {
    showToast({ severity: 'info', summary, detail, life });
  }, [showToast]);

  const showWarning = useCallback((summary: string, detail: string, life?: number) => {
    showToast({ severity: 'warn', summary, detail, life });
  }, [showToast]);

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
