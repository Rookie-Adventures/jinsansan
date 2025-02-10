import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FormField } from '../FormField';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Control } from 'react-hook-form';

// 创建一个包装组件来测试 FormField
interface TestFormData {
  testField: string;
}

interface TestFormProps {
  control: Control<TestFormData>;
  onSubmit?: (data: TestFormData) => void;
  defaultValues?: Partial<TestFormData>;
}

const schema = yup.object({
  testField: yup.string().required('这是必填项'),
});

// 测试配置
const TEST_TIMEOUT = 1000;

const TestForm: React.FC<TestFormProps> = ({ control, onSubmit, defaultValues }) => {
  const { handleSubmit } = useForm<TestFormData>({
    defaultValues: defaultValues || { testField: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit || (() => {}))} data-testid="test-form">
      <FormField<TestFormData> name="testField" control={control} label="测试字段" />
      <button type="submit">提交</button>
    </form>
  );
};

describe('FormField', () => {
  describe('基础渲染', () => {
    it('应该正确渲染文本输入框', () => {
      const WrapperComponent = () => {
        const { control } = useForm<TestFormData>({
          defaultValues: { testField: '' },
        });
        return <TestForm control={control} />;
      };

      render(<WrapperComponent />);
      const input = screen.getByRole('textbox', { name: /测试字段/i });
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('应该应用自定义属性', () => {
      const WrapperComponent = () => {
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

      render(<WrapperComponent />);
      const input = screen.getByRole('textbox', { name: /测试字段/i });
      expect(input).toHaveAttribute('placeholder', '请输入');
      expect(input).toBeDisabled();
    });
  });

  describe('错误状态', () => {
    it('应该显示验证错误消息', async () => {
      const WrapperComponent = () => {
        const { control } = useForm<TestFormData>({
          resolver: yupResolver(schema),
          mode: 'onBlur',
        });
        return <TestForm control={control} />;
      };

      render(<WrapperComponent />);
      const input = screen.getByRole('textbox');

      // 触发验证
      fireEvent.focus(input);
      fireEvent.blur(input);

      // 等待错误消息显示
      await waitFor(
        () => {
          const errorMessage = screen.getByText('这是必填项');
          expect(errorMessage).toBeInTheDocument();
          expect(input).toHaveAttribute('aria-invalid', 'true');
        },
        {
          timeout: TEST_TIMEOUT,
        }
      );
    });
  });

  describe('字段交互', () => {
    it('应该正确更新输入值', () => {
      const WrapperComponent = () => {
        const { control } = useForm<TestFormData>({
          defaultValues: { testField: '' },
        });
        return <TestForm control={control} />;
      };

      render(<WrapperComponent />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '测试值' } });
      expect(input).toHaveValue('测试值');
    });
  });

  describe('表单集成', () => {
    it('应该与 react-hook-form 正确集成', async () => {
      const onSubmit = vi.fn();

      const TestComponent = () => {
        const methods = useForm<TestFormData>({
          defaultValues: {
            testField: '测试值',
          },
        });

        return (
          <FormProvider {...methods}>
            <form data-testid="test-form" onSubmit={methods.handleSubmit(onSubmit)}>
              <FormField name="testField" label="测试字段" control={methods.control} />
              <button type="submit">提交</button>
            </form>
          </FormProvider>
        );
      };

      const { getByTestId } = render(<TestComponent />);

      const form = getByTestId('test-form');
      await act(async () => {
        fireEvent.submit(form);
      });

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          testField: '测试值',
        }),
        expect.anything()
      );
    });
  });
});
