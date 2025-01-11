import React, { createContext, useContext, useState, useCallback } from 'react';

import { ErrorNotification } from '@/components/ErrorNotification';
import type { HttpError } from '@/utils/http';

interface ErrorContextType {
  error: HttpError | null;
  setError: (error: HttpError | null) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [error, setError] = useState<HttpError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
      <ErrorNotification error={error} onClose={clearError} />
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}; 