import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoginForm } from '../LoginForm';
import { Provider } from 'react-redux';
import { store } from '@/store';

describe('LoginForm', () => {
  it('should render login form', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );
    
    expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );
    
    fireEvent.change(screen.getByLabelText(/用户名/i), {
      target: { value: 'test' },
    });
    
    fireEvent.change(screen.getByLabelText(/密码/i), {
      target: { value: 'test' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /登录/i }));
    
    await waitFor(() => {
      expect(store.getState().auth.token).toBe('mock-jwt-token');
    });
  });
}); 