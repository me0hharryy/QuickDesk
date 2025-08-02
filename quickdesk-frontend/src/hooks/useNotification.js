import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

export const useNotification = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showSuccess = useCallback((message, options = {}) => {
    return enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: 4000,
      ...options,
    });
  }, [enqueueSnackbar]);

  const showError = useCallback((message, options = {}) => {
    return enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: 6000,
      ...options,
    });
  }, [enqueueSnackbar]);

  const showWarning = useCallback((message, options = {}) => {
    return enqueueSnackbar(message, {
      variant: 'warning',
      autoHideDuration: 5000,
      ...options,
    });
  }, [enqueueSnackbar]);

  const showInfo = useCallback((message, options = {}) => {
    return enqueueSnackbar(message, {
      variant: 'info',
      autoHideDuration: 4000,
      ...options,
    });
  }, [enqueueSnackbar]);

  const showNotification = useCallback((message, variant = 'default', options = {}) => {
    return enqueueSnackbar(message, {
      variant,
      autoHideDuration: 4000,
      ...options,
    });
  }, [enqueueSnackbar]);

  const dismissNotification = useCallback((key) => {
    closeSnackbar(key);
  }, [closeSnackbar]);

  const dismissAll = useCallback(() => {
    closeSnackbar();
  }, [closeSnackbar]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNotification,
    dismissNotification,
    dismissAll,
  };
};

export default useNotification;
