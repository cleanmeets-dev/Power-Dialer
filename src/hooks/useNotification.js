import { useState, useCallback } from 'react';

/**
 * useNotification - Manages success and error notifications
 * Automatically clears notifications after timeout
 */
export const useNotification = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showNotification = useCallback((message, type = 'success') => {
    if (type === 'success') {
      setSuccessMessage(message);
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    } else {
      setErrorMessage(message);
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    successMessage,
    errorMessage,
    showNotification,
  };
};
