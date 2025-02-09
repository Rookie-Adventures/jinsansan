import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import mediaQuery from 'css-mediaquery';

import HomePage from '../HomePage';
import { theme } from '@/theme';
import { store } from '@/store';

// Mock 子组件
vi.mock('@/components/common/layout/Navbar', () => ({
  default: () => <div data-testid="mock-navbar">Navbar</div>
}));

vi.mock('@/components/business/sections/HeroSection', () => ({
  default: () => <div data-testid="mock-hero-section">HeroSection</div>
}));

vi.mock('@/components/business/sections/FeatureSection', () => ({
  default: () => <div data-testid="mock-feature-section">FeatureSection</div>
}));

vi.mock('@/components/business/sections/PricingSection', () => ({
  default: () => <div data-testid="mock-pricing-section">PricingSection</div>
}));

// 创建 matchMedia mock
function createMatchMedia(width: number) {
  return (query: string) => ({
    matches: mediaQuery.match(query, { width }),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
}

describe('HomePage', () => {
  const renderHomePage = (isDarkMode = false) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme(isDarkMode)}>
            <HomePage />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    // 重置 window.matchMedia
    window.matchMedia = createMatchMedia(1024);
  });

  it('应该正确渲染所有主要部分', () => {
    renderHomePage();

    // 验证所有主要部分都被渲染
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('mock-feature-section')).toBeInTheDocument();
    expect(screen.getByTestId('mock-pricing-section')).toBeInTheDocument();
  });

  it('应该正确应用布局样式', () => {
    renderHomePage();

    // 获取主容器
    const container = screen.getByTestId('mock-hero-section').parentElement;
    expect(container).toHaveStyle({
      background: 'linear-gradient(135deg, #24243e 0%, #302b63 50%, #0f0c29 100%)',
      color: 'white',
      position: 'relative'
    });
  });

  it('应该正确设置容器宽度和溢出处理', () => {
    const { container } = renderHomePage();
    
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveStyle({
      width: '100vw',
      overflow: 'hidden'
    });
  });

  it('应该在暗色主题下正确渲染', () => {
    renderHomePage(true);
    
    const mainContainer = screen.getByTestId('mock-hero-section').parentElement;
    expect(mainContainer).toHaveStyle({
      background: 'linear-gradient(135deg, #24243e 0%, #302b63 50%, #0f0c29 100%)'
    });
  });

  it('应该在移动端视图下正确渲染', () => {
    // 模拟移动端视口
    window.matchMedia = createMatchMedia(375);
    
    renderHomePage();
    
    const mainContainer = screen.getByTestId('mock-hero-section').parentElement;
    expect(mainContainer).toHaveStyle({
      paddingTop: '64px' // 导航栏空间
    });
  });

  // 添加快照测试
  it('应该匹配快照', () => {
    const { container } = renderHomePage();
    expect(container).toMatchSnapshot();
  });

  it('应该在暗色主题下匹配快照', () => {
    const { container } = renderHomePage(true);
    expect(container).toMatchSnapshot();
  });

  it('应该在移动端视图下匹配快照', () => {
    window.matchMedia = createMatchMedia(375);
    const { container } = renderHomePage();
    expect(container).toMatchSnapshot();
  });
}); 