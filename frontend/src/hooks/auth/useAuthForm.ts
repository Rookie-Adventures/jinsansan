import { useState, useCallback, useEffect } from 'react';

import type { LoginFormData, RegisterFormData } from '@/types/auth';

interface UseAuthFormOptions<T extends LoginFormData | RegisterFormData> {
  initialData: T;
}

interface UseAuthFormReturn<T extends LoginFormData | RegisterFormData> {
  formData: T;
  showPassword: boolean;
  handleFormChange: (data: Partial<T>) => void;
  togglePasswordVisibility: () => void;
}

const STORAGE_KEY = 'auth_form_data';

export const useAuthForm = <T extends LoginFormData | RegisterFormData>({
  initialData,
}: UseAuthFormOptions<T>): UseAuthFormReturn<T> => {
  const [formData, setFormData] = useState<T>(initialData);
  const [showPassword, setShowPassword] = useState(false);

  // 从本地存储加载保存的表单数据
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Failed to load saved form data:', error);
      }
    }
  }, []);

  // 保存表单数据到本地存储
  useEffect(() => {
    if ((formData as LoginFormData).rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [formData]);

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
