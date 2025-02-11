import { vi } from 'vitest';
import { useAuth } from '@/hooks/auth';
import type { ReactRouterModule } from '@/types/router';
import { render } from '@testing-library/react';
import { MemoryRouter, useNavigate, type MemoryRouterProps } from 'react-router-dom';
import React, { type ReactElement } from 'react';

export interface AuthTestConfig {
  component: ReactElement;
  mockNavigate?: ReturnType<typeof vi.fn>;
  routerProps?: Omit<MemoryRouterProps, 'children'>;
}

export const mockUseAuth = (overrides = {}) => {
  return vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: false,
    user: null,
    token: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    loading: false,
    error: null,
    ...overrides,
  });
};

export const mockAuthLoadingState = () => {
  return mockUseAuth({ loading: true });
};

export const mockAuthAuthenticatedState = (mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  permissions: ['read:posts'],
}) => {
  return mockUseAuth({
    isAuthenticated: true,
    user: mockUser,
    token: 'test-token',
  });
};

export const mockReactRouterAndAuth = () => {
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<ReactRouterModule>('react-router-dom');
    return {
      ...actual,
      useNavigate: vi.fn(),
    };
  });

  vi.mock('@/hooks/auth', () => ({
    useAuth: vi.fn(),
  }));
};

export const renderWithAuth = ({ 
  component, 
  mockNavigate = vi.fn(),
  routerProps = {}
}: AuthTestConfig) => {
  vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  return {
    ...render(
      React.createElement(MemoryRouter, routerProps, component)
    ),
    mockNavigate
  };
}; 