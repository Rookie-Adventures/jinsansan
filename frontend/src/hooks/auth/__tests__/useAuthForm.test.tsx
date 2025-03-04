import { renderHook, act } from '@testing-library/react';

import type { LoginFormData, RegisterFormData } from '@/types/auth';

import { useAuthForm } from '../useAuthForm';

describe('useAuthForm', () => {
  describe('基础功能', () => {
    it('应该使用初始数据初始化表单', () => {
      const initialLoginData: LoginFormData = {
        loginMethod: 'username',
        username: 'testuser',
        password: 'password123',
      };

      const { result } = renderHook(() => useAuthForm({ initialData: initialLoginData }));

      expect(result.current.formData).toEqual(initialLoginData);
      expect(result.current.showPassword).toBeFalsy();
    });

    it('应该使用初始注册数据初始化表单', () => {
      const initialRegisterData: RegisterFormData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        confirmPassword: 'password123',
      };

      const { result } = renderHook(() => useAuthForm({ initialData: initialRegisterData }));

      expect(result.current.formData).toEqual(initialRegisterData);
      expect(result.current.showPassword).toBeFalsy();
    });
  });

  describe('表单操作', () => {
    it('应该正确更新表单数据', () => {
      const initialData: LoginFormData = {
        loginMethod: 'username',
        username: '',
        password: '',
      };

      const { result } = renderHook(() => useAuthForm({ initialData }));

      act(() => {
        result.current.handleFormChange({ username: 'newuser' });
      });

      expect(result.current.formData).toEqual({
        loginMethod: 'username',
        username: 'newuser',
        password: '',
      });

      act(() => {
        result.current.handleFormChange({ password: 'newpassword' });
      });

      expect(result.current.formData).toEqual({
        loginMethod: 'username',
        username: 'newuser',
        password: 'newpassword',
      });
    });

    it('应该正确切换密码可见性', () => {
      const initialData: LoginFormData = {
        loginMethod: 'username',
        username: 'testuser',
        password: 'password123',
      };

      const { result } = renderHook(() => useAuthForm({ initialData }));

      expect(result.current.showPassword).toBeFalsy();

      act(() => {
        result.current.togglePasswordVisibility();
      });

      expect(result.current.showPassword).toBeTruthy();

      act(() => {
        result.current.togglePasswordVisibility();
      });

      expect(result.current.showPassword).toBeFalsy();
    });

    it('应该保持未更新的字段不变', () => {
      const initialRegisterData: RegisterFormData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        confirmPassword: 'password123',
      };

      const { result } = renderHook(() => useAuthForm({ initialData: initialRegisterData }));

      act(() => {
        result.current.handleFormChange({ email: 'newemail@example.com' });
      });

      expect(result.current.formData).toEqual({
        ...initialRegisterData,
        email: 'newemail@example.com',
      });
    });
  });

  describe('类型安全', () => {
    it('应该正确处理 LoginFormData 类型', () => {
      const initialLoginData: LoginFormData = {
        loginMethod: 'username',
        username: 'testuser',
        password: 'password123',
      };

      const { result } = renderHook(() =>
        useAuthForm<LoginFormData>({ initialData: initialLoginData })
      );

      act(() => {
        result.current.handleFormChange({ username: 'newuser' });
      });

      expect(result.current.formData).toEqual({
        loginMethod: 'username',
        username: 'newuser',
        password: 'password123',
      });
    });

    it('应该正确处理 RegisterFormData 类型', () => {
      const initialRegisterData: RegisterFormData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        confirmPassword: 'password123',
      };

      const { result } = renderHook(() =>
        useAuthForm<RegisterFormData>({ initialData: initialRegisterData })
      );

      act(() => {
        result.current.handleFormChange({ email: 'newemail@example.com' });
      });

      expect(result.current.formData).toEqual({
        ...initialRegisterData,
        email: 'newemail@example.com',
      });
    });
  });
});
