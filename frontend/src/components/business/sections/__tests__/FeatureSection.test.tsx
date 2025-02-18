import { useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { createTheme } from '@/theme';

import FeatureSection from '../FeatureSection';

// Mock useMediaQuery
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

describe('FeatureSection', () => {
  const renderFeatureSection = () => {
    return render(
      <ThemeProvider theme={createTheme(false)}>
        <FeatureSection />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    // 默认设置为桌面视图
    vi.mocked(useMediaQuery).mockReturnValue(false);
  });

  it('应该正确渲染标题和描述', () => {
    renderFeatureSection();

    expect(screen.getByText('核心功能')).toBeInTheDocument();
    expect(screen.getByText(/我们提供全面的 AI 模型服务/)).toBeInTheDocument();
  });

  it('应该正确渲染所有功能卡片', () => {
    renderFeatureSection();

    // 验证功能卡片
    expect(screen.getByText('流式响应')).toBeInTheDocument();
    expect(screen.getByText('智能上下文')).toBeInTheDocument();
    expect(screen.getByText('多模型支持')).toBeInTheDocument();
    expect(screen.getByText('安全可控')).toBeInTheDocument();
  });

  it('应该正确显示功能描述', () => {
    renderFeatureSection();

    expect(screen.getByText(/支持流式输出，实时响应/)).toBeInTheDocument();
    expect(screen.getByText(/智能管理对话上下文/)).toBeInTheDocument();
    expect(screen.getByText(/支持多种主流模型/)).toBeInTheDocument();
    expect(screen.getByText(/数据安全有保障/)).toBeInTheDocument();
  });

  it('应该在移动端正确响应', () => {
    // 模拟移动端视图
    vi.mocked(useMediaQuery).mockReturnValue(true);

    renderFeatureSection();

    const cards = screen.getAllByRole('article');
    cards.forEach(card => {
      expect(card).toHaveStyle({
        margin: '0 auto',
        maxWidth: '350px',
      });
    });
  });

  it('应该正确应用动画效果', async () => {
    renderFeatureSection();

    const cards = screen.getAllByRole('article');

    // 等待动画完成
    await new Promise(resolve => setTimeout(resolve, 1500));

    cards.forEach(card => {
      const styles = window.getComputedStyle(card);
      expect(styles.opacity).not.toBe('0');
      expect(styles.transform).not.toContain('translateY(20px)');
    });
  });

  it('应该正确显示图标', () => {
    renderFeatureSection();

    const icons = screen.getAllByTestId(/feature-icon/);
    expect(icons).toHaveLength(4);
    icons.forEach(icon => {
      expect(icon).toBeInTheDocument();
    });
  });

  // 添加快照测试
  it('应该匹配桌面端快照', () => {
    const { container } = renderFeatureSection();
    expect(container).toMatchSnapshot();
  });

  it('应该匹配移动端快照', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    const { container } = renderFeatureSection();
    expect(container).toMatchSnapshot();
  });
});
