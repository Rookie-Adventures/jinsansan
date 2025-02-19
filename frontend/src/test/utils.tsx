import { RenderOptions, render as rtlRender } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { store } from '@/store';

// 自定义渲染器选项接口
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  _initialState?: Record<string, unknown>;
}

// 自定义渲染器返回类型
interface RenderResult extends ReturnType<typeof rtlRender> {
  store: typeof store;
}

/**
 * 自定义渲染器
 * 包装了 testing-library 的 render 函数，添加了 Redux Provider 和 Router
 */
function render(
  ui: React.ReactElement,
  { route = '/', _initialState = {}, ...renderOptions }: CustomRenderOptions = {}
): RenderResult {
  // _initialState 参数暂时未使用，因为我们使用全局 store 实例
  // 如果需要在测试中使用不同的初始状态，应该修改这里来创建新的 store 实例
  function Wrapper({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  }

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
}

// 只导出自定义的 render 函数
export { render };
