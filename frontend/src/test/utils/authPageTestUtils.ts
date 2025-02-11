/** @jsx React.createElement */
import { render } from '@testing-library/react';
import { useNavigate, MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { ReactElement } from 'react';
import React from 'react';

export interface AuthFormData {
  username: string;
  password: string;
  email?: string;
  confirmPassword?: string;
}

export interface AuthFormState {
  formData: AuthFormData;
  showPassword: boolean;
  handleFormChange: ReturnType<typeof vi.fn>;
  togglePasswordVisibility: ReturnType<typeof vi.fn>;
}

export const mockAuthFormHook = (initialData: Partial<AuthFormData> = {}): AuthFormState => ({
  formData: {
    username: '',
    password: '',
    email: '',
    confirmPassword: '',
    ...initialData
  },
  showPassword: false,
  handleFormChange: vi.fn(),
  togglePasswordVisibility: vi.fn(),
});

export interface RouterProps {
  initialEntries?: string[];
  initialIndex?: number;
}

export interface AuthPageTestConfig {
  component: ReactElement;
  mockNavigate?: ReturnType<typeof vi.fn>;
  routerProps?: RouterProps;
}

export const renderAuthPage = ({ 
  component, 
  mockNavigate = vi.fn(),
  routerProps = {}
}: AuthPageTestConfig) => {
  vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  return {
    ...render(
      React.createElement(MemoryRouter, routerProps, component)
    ),
    mockNavigate
  };
}; 