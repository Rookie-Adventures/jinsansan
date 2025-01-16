import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '../LoginForm';
import { Provider } from 'react-redux';
import { store } from '@/store';

describe('LoginForm', () => {
  const mockFormData = {
    username: '',
    password: ''
  };

  const mockProps = {
    formData: mockFormData,
    showPassword: false,
    onSubmit: vi.fn(),
    onFormChange: vi.fn(),
    onTogglePassword: vi.fn()
  };

  it('should render login form', () => {
    render(
      <Provider store={store}>
        <LoginForm {...mockProps} />
      </Provider>
    );
    
    expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    render(
      <Provider store={store}>
        <LoginForm {...mockProps} />
      </Provider>
    );
    
    fireEvent.change(screen.getByLabelText(/用户名/i), {
      target: { value: 'test' },
    });
    
    fireEvent.change(screen.getByLabelText(/密码/i), {
      target: { value: 'test' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /登录/i }));
    
    expect(mockProps.onSubmit).toHaveBeenCalled();
  });
}); 