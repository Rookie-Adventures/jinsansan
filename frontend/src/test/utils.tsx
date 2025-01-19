import { RenderOptions, render as rtlRender } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { store } from '@/store'

// 自定义渲染器选项接口
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  initialState?: Record<string, unknown>
}

// 自定义渲染器
function render(
  ui: React.ReactElement,
  {
    route = '/',
    initialState = {},
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          {children}
        </MemoryRouter>
      </Provider>
    )
  }

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  }
}

// 重新导出所有 testing-library/react 的工具
export * from '@testing-library/react'
export { render }

