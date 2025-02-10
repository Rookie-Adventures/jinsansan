import React, { Suspense } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RouterProvider, createMemoryRouter, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Store } from '@reduxjs/toolkit';

// Mock components
const LoginPage = () => <div data-testid="login-page">Login Page</div>;
const HomePage = () => <div data-testid="home-page">Home Page</div>;
const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="main-layout">{children}</div>
);
const Loading = () => <div data-testid="loading">Loading...</div>;

// Mocks
vi.mock('../../pages/auth/LoginPage', () => ({ default: LoginPage }));
vi.mock('../../pages/home/HomePage', () => ({ default: HomePage }));
vi.mock('../../components/common/layout/MainLayout', () => ({ default: MainLayout }));

// Mock console.warn to suppress React Router warnings
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (args[0]?.includes?.('React Router')) return;
  originalWarn(...args);
};

// Types
interface AuthState {
  isAuthenticated: boolean;
}

interface RootState {
  auth: AuthState;
}

// Create a mock observable that satisfies Redux's Observable interface
const createMockObservable = () => {
  const observable = {
    subscribe: () => ({
      unsubscribe: vi.fn(),
    }),
    [Symbol.observable]: function () {
      return this;
    },
  };
  return observable;
};

// Create a basic test store
const createTestStore = (initialState = { isAuthenticated: false }): Store<RootState> => {
  const observable = createMockObservable();

  return {
    getState: () => ({ auth: initialState }),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
    replaceReducer: vi.fn(),
    [Symbol.observable]: () => observable,
  };
};

// Auth Guard Component
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Guest Guard Component
const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/" />;
};

// Create test routes with guards
const createTestRoutes = () => [
  {
    path: '/login',
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout>
          <HomePage />
        </MainLayout>
      </AuthGuard>
    ),
  },
];

// Test renderer
const renderApp = (initialPath = '/', initialState = { isAuthenticated: false }) => {
  const store = createTestStore(initialState);
  const routes = createTestRoutes();
  const router = createMemoryRouter(routes, {
    initialEntries: [initialPath],
  });

  return render(
    <Provider store={store}>
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
    </Provider>
  );
};

describe('Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Rendering', () => {
    it('should render login page at /login', async () => {
      renderApp('/login');

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should render home page at / when authenticated', async () => {
      renderApp('/', { isAuthenticated: true });

      await waitFor(() => {
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Flow', () => {
    it('should handle authentication state changes', async () => {
      const { rerender } = renderApp('/login');

      // Initial state - login page
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      // Rerender with authenticated state
      rerender(
        <Provider store={createTestStore({ isAuthenticated: true })}>
          <Suspense fallback={<Loading />}>
            <RouterProvider
              router={createMemoryRouter(createTestRoutes(), {
                initialEntries: ['/'],
              })}
            />
          </Suspense>
        </Provider>
      );

      // Should show home page
      await waitFor(
        () => {
          expect(screen.getByTestId('home-page')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});
