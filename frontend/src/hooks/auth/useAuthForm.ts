import { useState, useCallback } from 'react';

import type { LoginFormData, RegisterFormData } from '@/types/auth';

interface UseAuthFormOptions<T extends LoginFormData | RegisterFormData> {
  initialData: T;
}

export const useAuthForm = <T extends LoginFormData | RegisterFormData>({
  initialData,
}: UseAuthFormOptions<T>) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [showPassword, setShowPassword] = useState(false);

  const handleFormChange = useCallback((data: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return {
    formData,
    showPassword,
    handleFormChange,
    togglePasswordVisibility,
  };
};
