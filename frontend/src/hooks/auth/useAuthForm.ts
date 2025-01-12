import { useState, useCallback } from 'react';

import type { LoginFormData } from '@/types/auth';

export const useAuthForm = (initialData: LoginFormData = { username: '', password: '' }) => {
  const [formData, setFormData] = useState<LoginFormData>(initialData);
  const [showPassword, setShowPassword] = useState(false);

  const handleFormChange = useCallback((data: Partial<LoginFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setShowPassword(false);
  }, [initialData]);

  return {
    formData,
    showPassword,
    handleFormChange,
    togglePasswordVisibility,
    resetForm,
  };
}; 