import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRouteError } from 'react-router-dom';
import ErrorPage from '../ErrorPage';

// Mock useRouteError hook
vi.mock('react-router-dom', () => ({
  useRouteError: vi.fn(),
}));

describe('ErrorPage', () => {
  it('应该正确渲染错误页面的基本结构', () => {
    vi.mocked(useRouteError).mockReturnValue(new Error());

    render(<ErrorPage />);

    // 验证标题和描述文本
    expect(screen.getByText('Oops!')).toBeInTheDocument();
    expect(screen.getByText('Sorry, an unexpected error has occurred.')).toBeInTheDocument();
  });

  it('应该显示具体的错误信息', () => {
    const errorMessage = 'Test error message';
    vi.mocked(useRouteError).mockReturnValue(new Error(errorMessage));

    render(<ErrorPage />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('当没有错误信息时应该显示默认文本', () => {
    vi.mocked(useRouteError).mockReturnValue({});

    render(<ErrorPage />);

    expect(screen.getByText('Unknown error')).toBeInTheDocument();
  });

  it('应该使用正确的样式渲染', () => {
    vi.mocked(useRouteError).mockReturnValue(new Error());

    render(<ErrorPage />);

    // 验证标题样式
    const title = screen.getByText('Oops!');
    expect(title.tagName).toBe('H1');
    expect(title).toHaveClass('MuiTypography-h1');
    expect(title).toHaveClass('MuiTypography-gutterBottom');

    // 验证描述文本样式
    const description = screen.getByText('Sorry, an unexpected error has occurred.');
    expect(description.tagName).toBe('H5');
    expect(description).toHaveClass('MuiTypography-h5');
    expect(description).toHaveClass('MuiTypography-gutterBottom');
  });
});
