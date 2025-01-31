import type { LoginFormData } from '@/types/auth';
import { renderHook } from '@testing-library/react';
import { useAuthForm } from '../useAuthForm';

describe('useAuthForm', () => {
  const initialLoginData: LoginFormData = {
    username: '',
    password: '',
  };

  it('should initialize with initial data', () => {
    const { result } = renderHook(() => useAuthForm({ initialData: initialLoginData }));

    expect(result.current.formData).toEqual(initialLoginData);
    expect(result.current.showPassword).toBe(false);
  });

  it('should update form data correctly', async () => {
    const { result } = renderHook(() => useAuthForm({ initialData: initialLoginData }));

    result.current.handleFormChange({ username: 'testuser' });

    expect(result.current.formData).toEqual({
      username: 'testuser',
      password: '',
    });
  });

  it('should toggle password visibility', async () => {
    const { result } = renderHook(() => useAuthForm({ initialData: initialLoginData }));

    expect(result.current.showPassword).toBe(false);

    result.current.togglePasswordVisibility();

    expect(result.current.showPassword).toBe(true);
  });

  it('should merge partial updates with existing data', async () => {
    const { result } = renderHook(() => useAuthForm({ initialData: initialLoginData }));

    result.current.handleFormChange({ username: 'testuser' });
    result.current.handleFormChange({ password: 'testpass' });

    expect(result.current.formData).toEqual({
      username: 'testuser',
      password: 'testpass',
    });
  });
});
