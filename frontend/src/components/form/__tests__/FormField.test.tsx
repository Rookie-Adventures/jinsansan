import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FormField } from '../FormField';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// 创建一个包装组件来测试 FormField
interface TestFormData {
  testField: string;
}

const schema = yup.object({
  testField: yup.string().required('这是必填项')
});

describe('FormField', () => {
  describe('基础渲染', () => {
    it('应该正确渲染文本输入框', () => {
      const TestForm = () => {
        const { control } = useForm<TestFormData>({
          defaultValues: { testField: '' }
        });
        return (
          <FormField<TestFormData>
            name="testField"
            control={control}
            label="测试字段"
          />
        );
      };

      render(<TestForm />);
      const input = screen.getByRole('textbox', { name: /测试字段/i });
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('应该应用自定义属性', () => {
      const TestForm = () => {
        const { control } = useForm<TestFormData>();
        return (
          <FormField<TestFormData>
            name="testField"
            control={control}
            label="测试字段"
            placeholder="请输入"
            disabled
          />
        );
      };

      render(<TestForm />);
      const input = screen.getByRole('textbox', { name: /测试字段/i });
      expect(input).toHaveAttribute('placeholder', '请输入');
      expect(input).toBeDisabled();
    });
  });

  describe('错误状态', () => {
    it('应该显示验证错误消息', async () => {
      const TestForm = () => {
        const { control, handleSubmit } = useForm<TestFormData>({
          resolver: yupResolver(schema),
          mode: 'onBlur'
        });
        return (
          <form onSubmit={handleSubmit(() => {})}>
            <FormField<TestFormData>
              name="testField"
              control={control}
              label="测试字段"
            />
          </form>
        );
      };

      render(<TestForm />);
      const input = screen.getByRole('textbox');
      
      // 触发验证
      fireEvent.focus(input);
      fireEvent.blur(input);

      // 等待错误消息显示
      await waitFor(() => {
        const errorMessage = screen.getByText('这是必填项');
        expect(errorMessage).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-invalid', 'true');
      }, {
        timeout: 3000
      });
    });
  });

  describe('字段交互', () => {
    it('应该正确更新输入值', () => {
      const TestForm = () => {
        const { control } = useForm<TestFormData>({
          defaultValues: { testField: '' }
        });
        return (
          <FormField<TestFormData>
            name="testField"
            control={control}
            label="测试字段"
          />
        );
      };

      render(<TestForm />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '测试值' } });
      expect(input).toHaveValue('测试值');
    });
  });

  describe('表单集成', () => {
    it('应该与 react-hook-form 正确集成', async () => {
      const onSubmit = vi.fn();
      const TestForm = () => {
        const { control, handleSubmit } = useForm<TestFormData>({
          defaultValues: { testField: '' }
        });

        return (
          <form onSubmit={handleSubmit(onSubmit)} data-testid="test-form">
            <FormField<TestFormData>
              name="testField"
              control={control}
              label="测试字段"
            />
            <button type="submit">提交</button>
          </form>
        );
      };

      render(<TestForm />);
      const input = screen.getByRole('textbox');
      const form = screen.getByTestId('test-form');

      fireEvent.change(input, { target: { value: '测试值' } });
      await waitFor(() => {
        fireEvent.submit(form);
      });

      expect(onSubmit).toHaveBeenCalledWith(
        { testField: '测试值' },
        expect.anything()
      );
    });
  });
}); 