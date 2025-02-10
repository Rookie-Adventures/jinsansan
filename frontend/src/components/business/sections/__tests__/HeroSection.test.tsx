import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { vi } from 'vitest';

import HeroSection from '../HeroSection';
import { createTheme } from '@/theme';

// Mock useMediaQuery
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

describe('HeroSection', () => {
  const renderHeroSection = () => {
    return render(
      <ThemeProvider theme={createTheme(false)}>
        <HeroSection />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    // 默认设置为桌面视图
    vi.mocked(useMediaQuery).mockReturnValue(false);
  });

  it('应该正确渲染标题和副标题', () => {
    renderHeroSection();

    expect(screen.getByText(/优质的 Jinsansan 模型调用体验/i)).toBeInTheDocument();
    expect(screen.getByText(/为中国用户提供稳定、快速的 AI 模型服务/i)).toBeInTheDocument();
  });

  it('应该正确渲染特性标签', () => {
    renderHeroSection();

    expect(screen.getByText('快速响应')).toBeInTheDocument();
    expect(screen.getByText('稳定可靠')).toBeInTheDocument();
    expect(screen.getByText('智能管理')).toBeInTheDocument();
  });

  it('应该正确渲染 CTA 按钮', () => {
    renderHeroSection();

    const ctaButton = screen.getByText('立即体验');
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveStyle({
      textTransform: 'none',
    });
  });

  it('应该在移动端正确响应', () => {
    // 模拟移动端视图
    vi.mocked(useMediaQuery).mockReturnValue(true);

    renderHeroSection();

    const title = screen.getByText(/优质的 Jinsansan 模型调用体验/i);
    expect(title).toHaveStyle({
      fontSize: expect.stringMatching(/h3/),
    });
  });

  it('应该正确渲染图片', () => {
    renderHeroSection();

    const image = screen.getByAltText('AI Chat Illustration');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/ai-chat.svg');
  });

  it('应该正确应用动画效果', async () => {
    renderHeroSection();

    const contentContainer = screen.getByText(/优质的 Jinsansan 模型调用体验/i).parentElement;
    expect(contentContainer).not.toBeNull();

    // 等待动画完成
    await new Promise(resolve => setTimeout(resolve, 1500));

    const styles = window.getComputedStyle(contentContainer!);
    expect(styles.opacity).not.toBe('0');
    expect(styles.transform).not.toContain('translateX(-20px)');
  });

  // 添加快照测试
  it('应该匹配桌面端快照', () => {
    const { container } = renderHeroSection();
    expect(container).toMatchSnapshot();
  });

  it('应该匹配移动端快照', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    const { container } = renderHeroSection();
    expect(container).toMatchSnapshot();
  });
});
