import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { vi } from 'vitest';

import PricingSection from '../PricingSection';
import { theme } from '@/theme';

// Mock useMediaQuery
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual as any,
    useMediaQuery: vi.fn()
  };
});

describe('PricingSection', () => {
  const renderPricingSection = () => {
    return render(
      <ThemeProvider theme={theme(false)}>
        <PricingSection />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    // 默认设置为桌面视图
    vi.mocked(useMediaQuery).mockReturnValue(false);
  });

  it('应该正确渲染所有价格方案', () => {
    renderPricingSection();
    
    // 免费版
    expect(screen.getByText('免费版')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    
    // 专业版
    expect(screen.getByText('专业版')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
    expect(screen.getByText(/月/)).toBeInTheDocument();
    
    // 企业版
    expect(screen.getByText('企业版')).toBeInTheDocument();
    expect(screen.getByText('联系我们')).toBeInTheDocument();
  });

  it('应该正确显示最受欢迎标签', () => {
    renderPricingSection();
    
    const popularBadge = screen.getByText('最受欢迎');
    expect(popularBadge).toBeInTheDocument();
  });

  it('应该正确显示功能列表', () => {
    renderPricingSection();
    
    // 免费版功能
    expect(screen.getByText('每日固定调用次数')).toBeInTheDocument();
    expect(screen.getByText('基础模型支持')).toBeInTheDocument();
    expect(screen.getByText('标准响应速度')).toBeInTheDocument();
    expect(screen.getByText('社区支持')).toBeInTheDocument();
    
    // 专业版功能
    expect(screen.getByText('无限制调用次数')).toBeInTheDocument();
    expect(screen.getByText('所有模型支持')).toBeInTheDocument();
    expect(screen.getByText('优先响应速度')).toBeInTheDocument();
    expect(screen.getByText('专属客服支持')).toBeInTheDocument();

    // 企业版功能
    expect(screen.getByText('定制化解决方案')).toBeInTheDocument();
    expect(screen.getByText('API 独享配置')).toBeInTheDocument();
    expect(screen.getByText('企业级 SLA 保障')).toBeInTheDocument();
    expect(screen.getByText('7×24小时技术支持')).toBeInTheDocument();
  });

  it('应该在移动端正确响应', () => {
    // 模拟移动端视图
    vi.mocked(useMediaQuery).mockReturnValue(true);
    
    renderPricingSection();
    
    // 检查价格文字大小是否改变
    const priceElement = screen.getByText('0');
    expect(priceElement).toHaveClass('MuiTypography-h4');
  });

  it('应该正确处理按钮交互', () => {
    renderPricingSection();
    
    // 检查按钮文本和变体
    const freeButton = screen.getByText('立即使用');
    const proButton = screen.getByText('立即订阅');
    const enterpriseButton = screen.getByText('联系销售');
    
    expect(freeButton).toHaveClass('MuiButton-outlined');
    expect(proButton).toHaveClass('MuiButton-contained');
    expect(enterpriseButton).toHaveClass('MuiButton-outlined');
  });

  it('应该正确应用专业版的特殊样式', () => {
    renderPricingSection();
    
    const proCard = screen.getByText('专业版').closest('.MuiCard-root');
    expect(proCard).toHaveStyle({
      transform: 'scale(1.05)'
    });
  });

  // 添加快照测试
  it('应该匹配桌面端快照', () => {
    const { container } = renderPricingSection();
    expect(container).toMatchSnapshot();
  });

  it('应该匹配移动端快照', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    const { container } = renderPricingSection();
    expect(container).toMatchSnapshot();
  });
}); 