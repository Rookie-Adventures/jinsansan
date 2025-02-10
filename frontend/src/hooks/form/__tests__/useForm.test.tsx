import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useForm } from '../useForm';
import * as yup from 'yup';

interface TestFormData {
  username: string;
  email: string;
  age: number;
  [key: string]: string | number;
}

const schema = yup.object({
  username: yup.string().required('用户名是必填项'),
  email: yup.string().email('请输入有效的邮箱').required('邮箱是必填项'),
  age: yup.number().min(18, '年龄必须大于18岁').required('年龄是必填项'),
});

describe('useForm', () => {
  describe('基础功能', () => {
    it('应该使用默认值初始化表单', () => {
      const defaultValues = {
        username: 'testuser',
        email: 'test@example.com',
        age: 20,
      };

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          defaultValues,
        })
      );

      expect(result.current.getValues()).toEqual(defaultValues);
    });

    it('应该正确设置和获取字段值', () => {
      const { result } = renderHook(() => useForm<TestFormData>());

      act(() => {
        result.current.setValue('username', 'newuser');
      });

      expect(result.current.getValues('username')).toBe('newuser');
    });

    it('应该正确重置表单', () => {
      const defaultValues = {
        username: 'testuser',
        email: 'test@example.com',
        age: 20,
      };

      const { result } = renderHook(() =>
        useForm<TestFormData>({
          defaultValues,
        })
      );

      act(() => {
        result.current.setValue('username', 'newuser');
        result.current.reset();
      });

      expect(result.current.getValues()).toEqual(defaultValues);
    });
  });

  describe('表单验证', () => {
    it('应该正确验证必填字段', async () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({
          schema,
        })
      );

      await act(async () => {
        await result.current.trigger();
      });

      expect(result.current.errors).toHaveProperty('username');
      expect(result.current.errors).toHaveProperty('email');
      expect(result.current.errors).toHaveProperty('age');
    });

    it('应该正确验证邮箱格式', async () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({
          schema,
        })
      );

      act(() => {
        result.current.setValue('email', 'invalid-email');
      });

      await act(async () => {
        await result.current.trigger('email');
      });

      expect(result.current.errors.email?.message).toBe('请输入有效的邮箱');
    });

    it('应该正确验证年龄限制', async () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({
          schema,
        })
      );

      act(() => {
        result.current.setValue('age', 16);
      });

      await act(async () => {
        await result.current.trigger('age');
      });

      expect(result.current.errors.age?.message).toBe('年龄必须大于18岁');
    });
  });

  describe('表单状态', () => {
    it('应该正确跟踪表单是否被修改', async () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({
          defaultValues: {
            username: '',
            email: '',
            age: 0,
          },
        })
      );

      expect(result.current.isDirty).toBeFalsy();

      await act(async () => {
        result.current.setValue('username', 'testuser', {
          shouldDirty: true,
        });
        // 等待状态更新
        await result.current.trigger();
      });

      expect(result.current.isDirty).toBeTruthy();
    });

    it('应该正确跟踪表单是否正在提交', async () => {
      const { result } = renderHook(() => useForm<TestFormData>());

      expect(result.current.isSubmitting).toBeFalsy();

      const onSubmit = vi.fn().mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(resolve, 100);
          })
      );

      act(() => {
        result.current.handleSubmit(onSubmit)();
      });

      expect(result.current.isSubmitting).toBeTruthy();
    });

    it('应该正确跟踪表单是否有效', async () => {
      const { result } = renderHook(() =>
        useForm<TestFormData>({
          schema,
          mode: 'onChange',
        })
      );

      expect(result.current.isValid).toBeFalsy();

      act(() => {
        result.current.setValue('username', 'testuser');
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('age', 20);
      });

      await act(async () => {
        await result.current.trigger();
      });

      expect(result.current.isValid).toBeTruthy();
    });
  });

  describe('类型安全性', () => {
    it('应该提供类型安全的表单操作', () => {
      const { result } = renderHook(() => useForm<TestFormData>());

      // 正确的类型应该能通过编译
      act(() => {
        result.current.setValue('username', 'testuser');
        result.current.setValue('age', 25);
      });

      // 验证表单值已正确设置
      expect(result.current.getValues()).toEqual({
        username: 'testuser',
        age: 25,
      });
    });
  });
});
