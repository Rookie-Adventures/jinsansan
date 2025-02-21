import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider, createMemoryRouter, Outlet } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useRouteAnalytics } from '@/utils/router/analytics';
import { routerErrorHandler } from '@/utils/router/error-handler';

import { routes } from '../index';

// Types
interface AuthState {
  token: string | null;
}

interface RootState {
  auth: AuthState;
}

// Mock components
vi.mock('@/pages/HomePage', () => ({
  default: () => <div data-testid="home-page">Home Page</div>
}));

vi.mock('@/pages/auth/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}));

vi.mock('@/pages/auth/RegisterPage', () => ({
  default: () => <div data-testid="register-page">Register Page</div>
}));

vi.mock('@/pages/ErrorPage', () => ({
  default: () => <div data-testid="error-page">Error Page</div>
}));

vi.mock('@/components/common/layout/MainLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">
      <Outlet />
      {children}
    </div>
  )
}));

vi.mock('@/components/common/Loading', () => ({
  default: () => <div data-testid="loading">Loading...</div>
}));

// Mock hooks and utilities
vi.mock('@/utils/router/analytics', () => ({
  useRouteAnalytics: vi.fn()
}));

vi.mock('@/utils/router/error-handler', () => ({
  routerErrorHandler: {
    handleError: vi.fn()
  }
}));

// Mock store
const createTestStore = (initialState: Partial<RootState> = { auth: { token: null } }) => {
  return configureStore({
    reducer: {
      auth: (state = initialState.auth || { token: null }) => state
    },
    preloadedState: initialState
  });
};

// Test renderer with custom routes
const renderWithRouter = (
  initialEntries: string[] = ['/'],
  initialState: Partial<RootState> = { auth: { token: null } }
) => {
  const store = createTestStore(initialState);
  const router = createMemoryRouter(routes, {
    initialEntries
  });

  return render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
};

describe('Router Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Rendering', () => {
    it('should render login page at /login when not authenticated', async () => {
      renderWithRouter(['/login']);

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
      expect(useRouteAnalytics).toHaveBeenCalled();
    });

    it('should render register page at /register when not authenticated', async () => {
      renderWithRouter(['/register']);

      await waitFor(() => {
        expect(screen.getByTestId('register-page')).toBeInTheDocument();
      });
      expect(useRouteAnalytics).toHaveBeenCalled();
    });

    it('should render home page at / when authenticated', async () => {
      renderWithRouter(['/'], { auth: { token: 'valid-token' } });

      await waitFor(() => {
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      expect(useRouteAnalytics).toHaveBeenCalled();
    });

    it('should render dashboard page when authenticated', async () => {
      renderWithRouter(['/dashboard'], { auth: { token: 'valid-token' } });

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });

  describe('Route Guards', () => {
    it('should redirect to login when accessing protected route without auth', async () => {
      renderWithRouter(['/dashboard']);

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should redirect to home when accessing guest routes while authenticated', async () => {
      renderWithRouter(['/login'], { auth: { token: 'valid-token' } });

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should render error page when route throws error', async () => {
      const ErrorRoute = () => {
        throw new Error('Test error');
      };

      const testRoutes = [
        {
          path: '/error-test',
          element: <ErrorRoute />,
          errorElement: routes[0].errorElement
        }
      ];

      const router = createMemoryRouter(testRoutes, {
        initialEntries: ['/error-test']
      });

      render(
        <Provider store={createTestStore()}>
          <RouterProvider router={router} />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-page')).toBeInTheDocument();
      });

      expect(routerErrorHandler.handleError).toHaveBeenCalled();
    });

    it('should render error page for non-existent routes', async () => {
      renderWithRouter(['/non-existent']);

      await waitFor(() => {
        expect(screen.getByTestId('error-page')).toBeInTheDocument();
      });
    });
  });
});
