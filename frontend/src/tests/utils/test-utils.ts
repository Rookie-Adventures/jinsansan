// 非类型导入
import { render, screen } from '@testing-library/react';

// 类型导入
import type { RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

// 定义返回类型
interface TestComponentUtils extends ReturnType<typeof render> {
  Component: ReactElement;
}

interface FormTestUtils extends TestComponentUtils {
  findSubmitButton: () => Promise<HTMLElement>;
  findInputByLabel: (label: string | RegExp) => Promise<HTMLElement>;
}

interface AuthTestUtils extends FormTestUtils {
  findEmailInput: () => Promise<HTMLElement>;
  findPasswordInput: () => Promise<HTMLElement>;
}

// 通用测试工具函数
export const setupTestComponent = (
  Component: ReactElement,
  options?: RenderOptions
): TestComponentUtils => {
  return {
    ...render(Component, options),
    Component,
  };
};

// 通用表单测试工具
export const setupFormTest = (formComponent: ReactElement): FormTestUtils => {
  const utils = setupTestComponent(formComponent);
  return {
    ...utils,
    findSubmitButton: () => screen.findByRole('button', { name: /submit/i }),
    findInputByLabel: (label: string | RegExp) => screen.findByLabelText(label),
  };
};

// 通用认证测试工具
export const setupAuthTest = (authComponent: ReactElement): AuthTestUtils => {
  const utils = setupFormTest(authComponent);
  return {
    ...utils,
    findEmailInput: () => screen.findByLabelText(/email/i),
    findPasswordInput: () => screen.findByLabelText(/password/i),
  };
};

// 通用异步测试工具
export const expectAsyncState = async (
  callback: () => Promise<void> | void,
  matcher: () => void
): Promise<void> => {
  await callback();
  matcher();
};

// 通用错误处理测试工具
export const expectErrorState = async (
  action: () => Promise<void>,
  errorMatcher: (error: unknown) => void
): Promise<void> => {
  try {
    await action();
  } catch (error) {
    errorMatcher(error);
  }
}; 