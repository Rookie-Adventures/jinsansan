import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import type { AlertRule } from '@/infrastructure/monitoring/types';

import { AlertManager } from '@/infrastructure/monitoring/AlertManager';

import { AlertManagement } from '../AlertManagement';

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid'),
}));

// Mock AlertManager
const mockRules: AlertRule[] = [
  {
    id: 'rule-1',
    name: '测试规则1',
    type: 'threshold',
    metric: 'cpu_usage',
    condition: { operator: '>', value: 90 },
    severity: 'warning',
    enabled: true,
    notification: {},
  },
];

const mockAlertManager = {
  getRules: vi.fn(() => mockRules),
  addRule: vi.fn(),
  updateRule: vi.fn(),
  deleteRule: vi.fn(),
  getRule: vi.fn(id => mockRules.find(rule => rule.id === id)),
};

vi.spyOn(AlertManager, 'getInstance').mockImplementation(() => mockAlertManager as any);

describe('AlertManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该正确渲染添加规则按钮和规则列表', () => {
      render(<AlertManagement />);

      // 验证添加规则按钮存在
      expect(screen.getByText('添加规则')).toBeInTheDocument();

      // 验证规则列表渲染正确
      expect(screen.getByText('测试规则1')).toBeInTheDocument();
      expect(screen.getByText('cpu_usage > 90')).toBeInTheDocument();
    });

    it('应该正确渲染规则的操作按钮', () => {
      render(<AlertManagement />);

      // 验证启用/禁用开关存在
      expect(screen.getByRole('checkbox')).toBeInTheDocument();

      // 验证编辑和删除按钮存在
      expect(screen.getByTestId('EditIcon')).toBeInTheDocument();
      expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
    });
  });

  describe('规则操作', () => {
    it('点击添加规则按钮应该创建新规则', () => {
      render(<AlertManagement />);

      const addButton = screen.getByText('添加规则');
      fireEvent.click(addButton);

      expect(mockAlertManager.addRule).toHaveBeenCalledWith({
        id: 'test-uuid',
        name: '新规则',
        type: 'threshold',
        metric: '',
        condition: { operator: '>', value: 0 },
        severity: 'warning',
        enabled: true,
        notification: {},
      });
    });

    it('点击删除按钮应该删除规则', () => {
      render(<AlertManagement />);

      const deleteButton = screen.getByTestId('DeleteIcon').parentElement;
      fireEvent.click(deleteButton!);

      expect(mockAlertManager.deleteRule).toHaveBeenCalledWith('rule-1');
    });

    it('点击编辑按钮应该更新规则', () => {
      render(<AlertManagement />);

      const editButton = screen.getByTestId('EditIcon').parentElement;
      fireEvent.click(editButton!);

      expect(mockAlertManager.updateRule).toHaveBeenCalledWith(mockRules[0]);
    });

    it('切换开关应该更新规则状态', () => {
      render(<AlertManagement />);

      const toggleSwitch = screen.getByRole('checkbox');
      fireEvent.click(toggleSwitch);

      expect(mockAlertManager.updateRule).toHaveBeenCalledWith({
        ...mockRules[0],
        enabled: false,
      });
    });
  });

  describe('数据加载', () => {
    it('组件挂载时应该加载规则列表', () => {
      render(<AlertManagement />);

      expect(mockAlertManager.getRules).toHaveBeenCalled();
    });

    it('执行操作后应该重新加载规则列表', () => {
      render(<AlertManagement />);

      // 初始加载
      expect(mockAlertManager.getRules).toHaveBeenCalledTimes(1);

      // 添加规则
      const addButton = screen.getByText('添加规则');
      fireEvent.click(addButton);
      expect(mockAlertManager.getRules).toHaveBeenCalledTimes(2);

      // 删除规则
      const deleteButton = screen.getByTestId('DeleteIcon').parentElement;
      fireEvent.click(deleteButton!);
      expect(mockAlertManager.getRules).toHaveBeenCalledTimes(3);
    });
  });
});
