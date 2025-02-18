import { describe, it, expect } from 'vitest';

import type { LoginFormData, RegisterFormData } from '@/types/auth';

import { validateLoginForm, validateRegisterForm } from '../validation';

describe('validateLoginForm', () => {
  it('应该在表单数据有效时返回 isValid: true', () => {
    const validForm: LoginFormData = {
      username: 'testuser',
      password: 'password123',
    };

    const result = validateLoginForm(validForm);
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('应该在用户名为空时返回错误', () => {
    const formWithEmptyUsername: LoginFormData = {
      username: '',
      password: 'password123',
    };

    const result = validateLoginForm(formWithEmptyUsername);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('请输入用户名');
  });

  it('应该在用户名只包含空格时返回错误', () => {
    const formWithWhitespaceUsername: LoginFormData = {
      username: '   ',
      password: 'password123',
    };

    const result = validateLoginForm(formWithWhitespaceUsername);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('请输入用户名');
  });

  it('应该在密码为空时返回错误', () => {
    const formWithEmptyPassword: LoginFormData = {
      username: 'testuser',
      password: '',
    };

    const result = validateLoginForm(formWithEmptyPassword);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('请输入密码');
  });
});

describe('validateRegisterForm', () => {
  it('应该在表单数据有效时返回 isValid: true', () => {
    const validForm: RegisterFormData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const result = validateRegisterForm(validForm);
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('应该在用户名为空时返回错误', () => {
    const formWithEmptyUsername: RegisterFormData = {
      username: '',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const result = validateRegisterForm(formWithEmptyUsername);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('请输入用户名');
  });

  it('应该在邮箱为空时返回错误', () => {
    const formWithEmptyEmail: RegisterFormData = {
      username: 'testuser',
      email: '',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const result = validateRegisterForm(formWithEmptyEmail);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('请输入邮箱');
  });

  it('应该在邮箱格式无效时返回错误', () => {
    const formWithInvalidEmail: RegisterFormData = {
      username: 'testuser',
      email: 'invalid-email',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const result = validateRegisterForm(formWithInvalidEmail);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('请输入有效的邮箱地址');
  });

  it('应该在密码为空时返回错误', () => {
    const formWithEmptyPassword: RegisterFormData = {
      username: 'testuser',
      email: 'test@example.com',
      password: '',
      confirmPassword: 'password123',
    };

    const result = validateRegisterForm(formWithEmptyPassword);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('请输入密码');
  });

  it('应该在确认密码为空时返回错误', () => {
    const formWithEmptyConfirmPassword: RegisterFormData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: '',
    };

    const result = validateRegisterForm(formWithEmptyConfirmPassword);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('请确认密码');
  });

  it('应该在两次输入的密码不一致时返回错误', () => {
    const formWithMismatchedPasswords: RegisterFormData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password456',
    };

    const result = validateRegisterForm(formWithMismatchedPasswords);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('两次输入的密码不一致');
  });

  it('应该测试各种无效的邮箱格式', () => {
    const invalidEmails = [
      'test@',
      '@example.com',
      'test@.com',
      'test@com',
      'test.example.com',
      '@.com',
      'test@@example.com',
    ];

    invalidEmails.forEach(email => {
      const formWithInvalidEmail: RegisterFormData = {
        username: 'testuser',
        email,
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = validateRegisterForm(formWithInvalidEmail);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('请输入有效的邮箱地址');
    });
  });
});
